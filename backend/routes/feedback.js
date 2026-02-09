const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Submit new feedback (with optional blockchain tx)
router.post('/submit', feedbackController.submitFeedback);

// Get analytics summary
router.get('/summary', feedbackController.getAnalytics);

// Verify specific feedback against blockchain
router.get('/verify/:id', feedbackController.verifyFeedback);

// Get all feedback for a class
router.get('/class/:classId', feedbackController.getClassFeedback);

// Get all feedback with pagination
router.get('/all', feedbackController.getAllFeedback);

module.exports = router;
