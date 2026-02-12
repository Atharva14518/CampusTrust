const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./db');
const attendanceRoutes = require('./routes/attendance');
const certificateRoutes = require('./routes/certificate');
const feedbackRoutes = require('./routes/feedback');
const identityRoutes = require('./routes/identity');
const reportsRoutes = require('./routes/reports');
const analyticsRoutes = require('./routes/analytics');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const votingRoutes = require('./routes/voting');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for mobile access
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

// Trust proxy for accurate IP detection
app.set('trust proxy', true);

// Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/identity', identityRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/voting', votingRoutes);

// All students endpoint (for Teacher/HOD dashboards)
app.get('/api/students/all', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                a.wallet_address as address,
                MAX(a.student_name) as name,
                COUNT(a.id) as total_attendance,
                MAX(a.timestamp) as last_seen
            FROM attendance a
            GROUP BY a.wallet_address
            ORDER BY total_attendance DESC
        `);
        res.json({ success: true, students: rows });
    } catch (error) {
        console.error('Get all students error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve static frontend files in production
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Handle React Router - serve index.html for all non-API routes
app.get('/{*path}', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(frontendPath, 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
