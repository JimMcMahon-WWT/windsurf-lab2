const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../utils/validators');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes with rate limiting
router.post('/register', registerLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, authController.refreshToken);

// Protected routes
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;
