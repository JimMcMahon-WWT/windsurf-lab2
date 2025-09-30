const { protect, restrictTo, optionalAuth } = require('../../../middleware/auth');
const { createTestUser } = require('../../helpers/testHelpers');
const authService = require('../../../services/authService');
const ApiError = require('../../../utils/apiError');

describe('Auth Middleware', () => {
  let testUser, token;

  beforeEach(async () => {
    const result = await createTestUser();
    testUser = result.user;
    token = result.token;
  });

  describe('protect middleware', () => {
    it('should authenticate valid token', async () => {
      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {};
      const next = jest.fn();

      await protect(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(testUser._id.toString());
    });

    it('should reject request without token', async () => {
      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      await protect(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it('should reject invalid token', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid_token'
        }
      };
      const res = {};
      const next = jest.fn();

      await protect(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it('should reject token for non-existent user', async () => {
      const fakeToken = authService.generateToken('507f1f77bcf86cd799439011');
      
      const req = {
        headers: {
          authorization: `Bearer ${fakeToken}`
        }
      };
      const res = {};
      const next = jest.fn();

      await protect(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it('should reject token for inactive user', async () => {
      testUser.isActive = false;
      await testUser.save();

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {};
      const next = jest.fn();

      await protect(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(403);
    });

    it('should accept token from cookies', async () => {
      const req = {
        headers: {},
        cookies: {
          token: token
        }
      };
      const res = {};
      const next = jest.fn();

      await protect(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
    });
  });

  describe('restrictTo middleware', () => {
    it('should allow access for correct role', () => {
      const req = {
        user: {
          role: 'admin'
        }
      };
      const res = {};
      const next = jest.fn();

      const middleware = restrictTo('admin', 'moderator');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access for incorrect role', () => {
      const req = {
        user: {
          role: 'user'
        }
      };
      const res = {};
      const next = jest.fn();

      const middleware = restrictTo('admin', 'moderator');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(403);
    });

    it('should deny access without user', () => {
      const req = {};
      const res = {};
      const next = jest.fn();

      const middleware = restrictTo('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });
  });

  describe('optionalAuth middleware', () => {
    it('should attach user if valid token provided', async () => {
      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {};
      const next = jest.fn();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
    });

    it('should continue without user if no token provided', async () => {
      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeUndefined();
    });

    it('should continue without user if invalid token provided', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid_token'
        }
      };
      const res = {};
      const next = jest.fn();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeNull();
    });
  });
});
