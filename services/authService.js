const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const config = require('../config/config');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

class AuthService {
  // Generate JWT token
  generateToken(userId) {
    return signAccessToken(userId);
  }

  // Generate refresh token
  generateRefreshToken(userId) {
    return signRefreshToken(userId);
  }

  // Register new user
  async register(userData) {
    const { username, name, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        throw ApiError.conflict('User already exists with this email');
      }
      if (existingUser.username === username) {
        throw ApiError.conflict('Username is already taken');
      }
    }

    // Create user
    const user = await User.create({
      username,
      name,
      email,
      password
    });

    // Generate tokens
    const token = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user,
      token,
      refreshToken
    };
  }

  // Login user
  async login(identifier, password) {
    // Find user by email or username with password field
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      throw ApiError.forbidden('Account is temporarily locked due to too many failed login attempts. Please try again later.');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate tokens
    const token = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Remove password from response
    user.password = undefined;

    return {
      user,
      token,
      refreshToken
    };
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      const user = await User.findById(decoded.id).select('+refreshToken');
      
      if (!user || user.refreshToken !== refreshToken) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      // Generate new access token
      const newToken = this.generateToken(user._id);

      return { token: newToken };
    } catch (error) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
  }

  // Get current user
  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }
}

module.exports = new AuthService();
