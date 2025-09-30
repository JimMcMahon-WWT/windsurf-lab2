/**
 * Test environment specific configuration
 */
module.exports = {
  server: {
    port: 3001,
    env: 'test'
  },

  database: {
    uri: 'mongodb://localhost:27017/task-management-test'
  },

  logging: {
    level: 'error',
    format: 'dev'
  },

  features: {
    swagger: false,
    playground: false
  },

  security: {
    bcryptRounds: 4, // Faster for tests
    rateLimit: {
      windowMs: 900000,
      maxRequests: 10000 // No limits for tests
    }
  }
};
