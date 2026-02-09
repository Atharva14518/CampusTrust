const db = require('../db');
const algosdk = require('algosdk');
const notificationService = require('../services/notificationService');

// Algorand Client
const algodClient = new algosdk.Algodv2('', process.env.ALGO_ALGOD_SERVER || 'https://testnet-api.4160.nodely.dev', '');

exports.markAttendance = async (req, res) => {
    try {
        const { classId, walletAddress, studentName, txId, distance, parentPhone } = req.body;

        if (!classId || !walletAddress || !txId) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Verify transaction on Algorand
        try {
            const txInfo = await algodClient.pendingTransactionInformation(txId).do();

            if (!txInfo['confirmed-round']) {
                return res.status(400).json({ success: false, error: 'Transaction not confirmed' });
            }

            // Store in database
            const [rows] = await db.execute(
                'INSERT INTO attendance (class_id, wallet_address, student_name, tx_id, timestamp, status) VALUES (?, ?, ?, ?, NOW(), ?)',
                [classId, walletAddress, studentName || 'Anonymous', txId, 'CONFIRMED']
            );

            // Send SMS notification to parent if phone provided
            let smsSent = false;
            if (parentPhone && parentPhone.length >= 10) {
                try {
                    const smsResult = await notificationService.sendParentNotification(
                        parentPhone,
                        studentName || 'Your child',
                        classId,
                        new Date()
                    );
                    smsSent = smsResult.success;
                    console.log(`📱 Parent SMS ${smsSent ? 'sent' : 'failed'} to ${parentPhone}`);
                } catch (smsError) {
                    console.error('SMS sending error:', smsError.message);
                }
            }

            res.json({
                success: true,
                message: 'Attendance marked successfully',
                recordId: rows.insertId,
                smsSent: smsSent,
                distance: distance
            });

        } catch (txError) {
            console.error('Transaction verification error:', txError);
            return res.status(400).json({ success: false, error: 'Invalid transaction' });
        }

    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAttendanceByClass = async (req, res) => {
    try {
        const { classId } = req.query;

        if (!classId) {
            return res.status(400).json({ success: false, error: 'Class ID required' });
        }

        const [rows] = await db.execute(
            'SELECT * FROM attendance WHERE class_id = ? ORDER BY timestamp DESC',
            [classId]
        );

        res.json({ success: true, attendance: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMyAttendance = async (req, res) => {
    try {
        const { address } = req.query;

        if (!address) {
            return res.status(400).json({ success: false, error: 'Address required' });
        }

        const [rows] = await db.execute(
            'SELECT * FROM attendance WHERE wallet_address = ? ORDER BY timestamp DESC',
            [address]
        );

        res.json({ success: true, attendance: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getReport = async (req, res) => {
    try {
        const { address, classId } = req.query;

        let query = 'SELECT * FROM attendance WHERE 1=1';
        const params = [];

        if (address) {
            query += ' AND wallet_address = ?';
            params.push(address);
        }

        if (classId) {
            query += ' AND class_id = ?';
            params.push(classId);
        }

        query += ' ORDER BY timestamp DESC';

        const [rows] = await db.execute(query, params);
        res.json({ success: true, records: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
