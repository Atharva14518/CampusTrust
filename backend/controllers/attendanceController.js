const db = require('../db');
const algosdk = require('algosdk');
const notificationService = require('../services/notificationService');

// Algorand Client
const algodClient = new algosdk.Algodv2('', process.env.ALGO_ALGOD_SERVER || 'https://testnet-api.4160.nodely.dev', '');

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

exports.markAttendance = async (req, res) => {
    try {
        const {
            classId,
            walletAddress,
            studentName,
            txId,
            distance,
            parentPhone,
            // New: location data for server-side validation
            studentLocation,
            classLocation,
            qrExpiry,
            maxDistance
        } = req.body;

        if (!classId || !walletAddress || !txId) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // SERVER-SIDE VALIDATION 1: Check QR expiry
        if (qrExpiry && Date.now() > qrExpiry) {
            return res.status(400).json({
                success: false,
                error: 'QR code has expired. Please get a new QR from your teacher.'
            });
        }

        // SERVER-SIDE VALIDATION 2: Verify geolocation if provided
        if (studentLocation && classLocation) {
            const serverDistance = calculateDistance(
                studentLocation.lat, studentLocation.lng,
                classLocation.lat, classLocation.lng
            );

            const allowedDistance = maxDistance || 100; // Default 100 meters

            if (serverDistance > allowedDistance) {
                console.log(`🚨 Location fraud detected! Distance: ${serverDistance}m, Allowed: ${allowedDistance}m`);
                return res.status(400).json({
                    success: false,
                    error: `You are ${Math.round(serverDistance)}m away. Must be within ${allowedDistance}m of classroom.`,
                    fraudDetected: true
                });
            }

            console.log(`✅ Location verified: ${Math.round(serverDistance)}m from classroom`);
        }

        // SERVER-SIDE VALIDATION 3: Anti-Proxy (IP Check)
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Check if this IP has already marked attendance for this class
        const [existingIp] = await db.execute(
            'SELECT id FROM attendance WHERE class_id = ? AND ip_address = ?',
            [classId, ipAddress]
        );

        if (existingIp.length > 0) {
            console.log(`🚨 Proxy detected! Duplicate IP: ${ipAddress} for class ${classId}`);
            return res.status(403).json({
                success: false,
                error: 'Attendance already marked from this device/IP. One entry per device allowed.',
                proxyDetected: true
            });
        }

        // Verify transaction on Algorand
        try {
            const txInfo = await algodClient.pendingTransactionInformation(txId).do();

            if (!txInfo['confirmed-round']) {
                return res.status(400).json({ success: false, error: 'Transaction not confirmed' });
            }

            // Store in database with location data and IP
            const [rows] = await db.execute(
                'INSERT INTO attendance (class_id, wallet_address, student_name, tx_id, timestamp, status, ip_address) VALUES (?, ?, ?, ?, NOW(), ?, ?)',
                [
                    classId,
                    walletAddress,
                    studentName || 'Anonymous',
                    txId,
                    'CONFIRMED',
                    ipAddress
                ]
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
                distance: distance,
                serverValidated: true,
                ip: ipAddress
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
