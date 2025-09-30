const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// Disable rate limiting when running tests
const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
const passthrough = (req, res, next) => next();

/**
 * General API rate limiter
 * Applies to all routes
 */
const apiLimiter = isTest ? passthrough : rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

/**
 * Auth rate limiter (stricter for login/register)
 */
const authLimiter = isTest ? passthrough : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false
});

/**
 * Password reset rate limiter
 */
const passwordResetLimiter = isTest ? passthrough : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Registration rate limiter
 * Prevent spam registrations
 */
const registerLimiter = isTest ? passthrough : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registrations per hour
  message: {
    success: false,
    message: 'Too many accounts created from this IP, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Create task rate limiter
 * Prevent spam task creation
 */
const createTaskLimiter = isTest ? passthrough : rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 task creations per minute
  message: {
    success: false,
    message: 'Too many tasks created, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  registerLimiter,
  createTaskLimiter
};
