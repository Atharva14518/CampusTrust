const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/mark', attendanceController.markAttendance);
router.get('/report', attendanceController.getReport);
router.get('/class', attendanceController.getAttendanceByClass);
router.get('/my', attendanceController.getMyAttendance);

module.exports = router;
