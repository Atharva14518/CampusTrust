const express = require('express');
const router = express.Router();
const identityController = require('../controllers/identityController');

router.post('/register', identityController.register);
router.post('/login', identityController.login);
router.get('/:wallet_address', identityController.getProfile);

module.exports = router;
