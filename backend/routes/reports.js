const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// Legacy Ollama report
router.post('/generate', reportsController.generateReport);

// AI-powered insights (Gemini)
router.get('/ai-insights', reportsController.getAIInsights);

// Class-specific report
router.get('/class/:classId', reportsController.getClassReport);

// Statistics summary for charts
router.get('/stats', reportsController.getStatsSummary);

module.exports = router;
