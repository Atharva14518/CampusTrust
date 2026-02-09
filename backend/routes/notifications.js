const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const db = require('../db');

// Send test SMS
router.post('/test', async (req, res) => {
    const { phone, message } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Phone number required' });
    }

    const result = await notificationService.sendSMS(phone, message || 'Test from TrustCampus!');
    res.json(result);
});

// Send attendance notification
router.post('/attendance', async (req, res) => {
    const { phone, studentName, classId } = req.body;

    if (!phone || !studentName || !classId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await notificationService.sendAttendanceConfirmation(phone, studentName, classId);
    res.json(result);
});

// Send parent notification
router.post('/parent', async (req, res) => {
    const { parentPhone, studentName, classId } = req.body;

    if (!parentPhone || !studentName || !classId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await notificationService.sendParentNotification(
        parentPhone,
        studentName,
        classId,
        new Date()
    );
    res.json(result);
});

// Get notification status
router.get('/status', (req, res) => {
    res.json({
        enabled: notificationService.isEnabled(),
        provider: 'Twilio'
    });
});

module.exports = router;
