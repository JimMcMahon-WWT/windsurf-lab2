const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Standard JWT claims builder
const buildClaims = (id, extra = {}) => ({
  sub: String(id),
  id: String(id),
  iss: config.jwt.issuer || 'task-management-api',
  aud: config.jwt.audience || 'task-management-client',
  ...extra,
});

// Access token
const signAccessToken = (userId, extra = {}) =>
  jwt.sign(buildClaims(userId, extra), config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

const verifyAccessToken = (token) =>
  jwt.verify(token, config.jwt.secret);

// Refresh token
const signRefreshToken = (userId, extra = {}) =>
  jwt.sign(buildClaims(userId, extra), config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

const verifyRefreshToken = (token) =>
  jwt.verify(token, config.jwt.refreshSecret);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  buildClaims,
};
