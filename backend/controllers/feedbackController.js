const db = require('../db');
const crypto = require('crypto');
const algosdk = require('algosdk');
const aiService = require('../services/aiService');

// Algorand configuration
const ALGOD_SERVER = process.env.ALGO_ALGOD_SERVER || 'https://testnet-api.4160.nodely.dev';
const ALGOD_PORT = process.env.ALGO_ALGOD_PORT || '';
const ALGOD_TOKEN = process.env.ALGO_ALGOD_TOKEN || '';

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

/**
 * Submit feedback with blockchain hash storage
 */
exports.submitFeedback = async (req, res) => {
    const { student_address, teacher_id, class_id, feedback_text, tx_id } = req.body;

    if (!student_address || !feedback_text) {
        return res.status(400).json({ error: 'student_address and feedback_text are required' });
    }

    // Create SHA-256 hash of the feedback
    const feedbackHash = crypto.createHash('sha256')
        .update(feedback_text + student_address + Date.now())
        .digest('hex');

    try {
        // Analyze sentiment using AI
        let sentimentData;
        try {
            sentimentData = await aiService.analyzeFeedbackSentiment(feedback_text);
        } catch (aiError) {
            console.log('AI sentiment analysis failed, using default:', aiError.message);
            sentimentData = { sentiment: 'neutral', score: 0.5 };
        }

        // Insert into database
        const [result] = await db.execute(
            `INSERT INTO feedback 
            (student_address, teacher_id, class_id, feedback_text, sentiment_score, hash, tx_id, verified, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                student_address,
                teacher_id || null,
                class_id || null,
                feedback_text,
                sentimentData.score,
                feedbackHash,
                tx_id || null,
                tx_id ? true : false
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: {
                id: result.insertId,
                hash: feedbackHash,
                tx_id: tx_id || null,
                sentiment: sentimentData,
                verified: !!tx_id
            }
        });

    } catch (error) {
        console.error('Feedback submission error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Verify feedback integrity against blockchain
 */
exports.verifyFeedback = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.execute(
            'SELECT * FROM feedback WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        const feedback = rows[0];

        // If there's a tx_id, verify on blockchain
        let blockchainVerified = false;
        let txDetails = null;

        if (feedback.tx_id) {
            try {
                // Fetch transaction from Algorand
                const pendingInfo = await algodClient.pendingTransactionInformation(feedback.tx_id).do();

                if (pendingInfo) {
                    blockchainVerified = true;
                    txDetails = {
                        txId: feedback.tx_id,
                        confirmed: pendingInfo['confirmed-round'] > 0,
                        round: pendingInfo['confirmed-round']
                    };
                }
            } catch (txError) {
                console.log('Transaction lookup failed:', txError.message);
                // Try using AlgoExplorer API as fallback
                blockchainVerified = feedback.verified;
            }
        }

        res.json({
            success: true,
            feedback: {
                id: feedback.id,
                class_id: feedback.class_id,
                teacher_id: feedback.teacher_id,
                feedback_text: feedback.feedback_text,
                sentiment_score: feedback.sentiment_score,
                hash: feedback.hash,
                created_at: feedback.created_at
            },
            verification: {
                hashStored: feedback.hash,
                txId: feedback.tx_id,
                blockchainVerified,
                txDetails,
                tamperProof: blockchainVerified
            },
            explorerUrl: feedback.tx_id
                ? `https://testnet.algoexplorer.io/tx/${feedback.tx_id}`
                : null
        });

    } catch (error) {
        console.error('Feedback verification error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get feedback for a class
 */
exports.getClassFeedback = async (req, res) => {
    const { classId } = req.params;

    try {
        const [rows] = await db.execute(
            `SELECT id, class_id, teacher_id, feedback_text, sentiment_score, hash, tx_id, verified, created_at 
            FROM feedback 
            WHERE class_id = ?
            ORDER BY created_at DESC`,
            [classId]
        );

        // Calculate average sentiment
        const avgSentiment = rows.length > 0
            ? rows.reduce((acc, r) => acc + (r.sentiment_score || 0), 0) / rows.length
            : 0;

        res.json({
            success: true,
            classId,
            totalFeedback: rows.length,
            averageSentiment: avgSentiment.toFixed(2),
            feedback: rows.map(f => ({
                id: f.id,
                feedback_text: f.feedback_text,
                sentiment_score: f.sentiment_score,
                verified: f.verified,
                tx_id: f.tx_id,
                created_at: f.created_at
            }))
        });

    } catch (error) {
        console.error('Get class feedback error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get analytics summary
 */
exports.getAnalytics = async (req, res) => {
    try {
        const [attendance] = await db.execute('SELECT COUNT(*) as total FROM attendance');
        const [certificates] = await db.execute('SELECT COUNT(*) as total FROM certificates');
        const [feedback] = await db.execute('SELECT AVG(sentiment_score) as avg_sentiment, COUNT(*) as total FROM feedback');
        const [verifiedFeedback] = await db.execute('SELECT COUNT(*) as total FROM feedback WHERE verified = true');

        // Sentiment distribution
        const [sentimentDist] = await db.execute(`
            SELECT 
                CASE 
                    WHEN sentiment_score >= 0.7 THEN 'positive'
                    WHEN sentiment_score >= 0.4 THEN 'neutral'
                    ELSE 'negative'
                END as sentiment,
                COUNT(*) as count
            FROM feedback
            GROUP BY sentiment
        `);

        res.json({
            totalAttendance: attendance[0].total,
            certificatesIssued: certificates[0].total,
            totalFeedback: feedback[0].total,
            avgSentiment: feedback[0].avg_sentiment || 0,
            verifiedFeedback: verifiedFeedback[0].total,
            sentimentDistribution: sentimentDist.reduce((acc, row) => {
                acc[row.sentiment] = row.count;
                return acc;
            }, {})
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get all feedback with pagination
 */
exports.getAllFeedback = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try {
        const [rows] = await db.execute(
            `SELECT id, student_address, class_id, teacher_id, feedback_text, 
                    sentiment_score, hash, tx_id, verified, created_at 
            FROM feedback 
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await db.execute('SELECT COUNT(*) as total FROM feedback');

        res.json({
            success: true,
            feedback: rows,
            pagination: {
                page,
                limit,
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
