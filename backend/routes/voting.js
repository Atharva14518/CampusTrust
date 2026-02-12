const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');

router.get('/proposals', proposalController.getProposals);
router.post('/proposals', proposalController.createProposal);
router.post('/vote', proposalController.vote);
router.get('/votes', proposalController.getVotes);

module.exports = router;
