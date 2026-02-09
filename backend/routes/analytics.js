const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/summary', async (req, res) => {
    try {
        // execute queries in parallel
        const [students] = await db.query('SELECT COUNT(*) as count FROM students');
        const [attendance] = await db.query('SELECT COUNT(*) as count FROM attendance');
        const [certificates] = await db.query('SELECT COUNT(*) as count FROM certificates');

        // Mock data for chart if DB empty
        const attendanceByDept = {
            'CSE': 85,
            'ECE': 78,
            'MECH': 92,
            'CIVIL': 88
        };

        res.json({
            students: students[0].count,
            attendance: attendance[0].count,
            certificates: certificates[0].count,
            attendanceByDept
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
