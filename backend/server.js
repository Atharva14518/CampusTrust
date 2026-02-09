const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const attendanceRoutes = require('./routes/attendance');
const certificateRoutes = require('./routes/certificate');
const feedbackRoutes = require('./routes/feedback');
const identityRoutes = require('./routes/identity');
const reportsRoutes = require('./routes/reports');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for mobile access
app.use(cors({
    origin: '*', // Allow all origins in development
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/identity', identityRoutes);
app.use('/api/reports', reportsRoutes);
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);
const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('TrustCampus API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
