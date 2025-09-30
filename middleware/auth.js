const { verifyAccessToken } = require('../utils/jwt');
const config = require('../config/config');
const ApiError = require('../utils/apiError');
const User = require('../models/User');

/**
 * Protect routes - Verify JWT token and authenticate user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Also check for token in cookies (if using cookie-based auth)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw ApiError.unauthorized('Not authorized to access this route. Please login.');
    }

    try {
      // Verify token
      const decoded = verifyAccessToken(token);

      // Get user from token (exclude sensitive fields)
      req.user = await User.findById(decoded.id).select('+passwordChangedAt');

      if (!req.user) {
        throw ApiError.unauthorized('User no longer exists');
      }

      // Check if user is active
      if (!req.user.isActive) {
        throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
      }

      // Check if user changed password after token was issued
      if (req.user.changedPasswordAfter(decoded.iat)) {
        throw ApiError.unauthorized('Password was recently changed. Please login again.');
      }

      // Check if account is locked
      if (req.user.isLocked) {
        throw ApiError.forbidden('Your account is temporarily locked. Please try again later.');
      }

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw ApiError.unauthorized('Invalid token. Please login again.');
      } else if (error.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Token expired. Please login again.');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict access to specific roles
 * @param  {...string} roles - Allowed roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authorized'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }

    next();
  };
};

/**
 * Optional authentication - Attach user if token is valid, but don't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        req.user = await User.findById(decoded.id);
      } catch (error) {
        // Token invalid, but continue without user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email is confirmed
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Not authorized'));
  }

  if (!req.user.isEmailVerified) {
    return next(ApiError.forbidden('Please verify your email address to access this resource'));
  }

  next();
};

module.exports = { 
  protect, 
  restrictTo, 
  optionalAuth,
  requireEmailVerification
};
