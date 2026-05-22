const express = require('express');
const authController = require('../controllers/authController');
const { validateRegister } = require('../middleware/validators/authValidator');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Cascade Layering: Apply rate limiting to all authentication paths
router.use(authLimiter);

router.post('/register', validateRegister, authController.register);
router.post('/login', authController.login);

module.exports = router;