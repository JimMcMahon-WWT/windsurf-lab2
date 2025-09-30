const authService = require('../services/authService');

class AuthController {
  // @desc    Register a new user
  // @route   POST /api/v1/auth/register
  // @access  Public
  async register(req, res, next) {
    try {
      const { user, token, refreshToken } = await authService.register(req.body);

      res.status(201).json({
        success: true,
        data: {
          user,
          token,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Login user
  // @route   POST /api/v1/auth/login
  // @access  Public
  async login(req, res, next) {
    try {
      const { identifier, email, password } = req.body;
      // Support both 'identifier' (new) and 'email' (legacy) fields
      const loginIdentifier = identifier || email;
      const { user, token, refreshToken } = await authService.login(loginIdentifier, password);

      res.status(200).json({
        success: true,
        data: {
          user,
          token,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Refresh access token
  // @route   POST /api/v1/auth/refresh
  // @access  Public
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const { token } = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: { token }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get current user
  // @route   GET /api/v1/auth/me
  // @access  Private
  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user._id);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
