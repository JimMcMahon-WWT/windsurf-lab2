/**
 * Development environment specific configuration
 */
module.exports = {
  server: {
    port: 3000,
    env: 'development'
  },
  
  database: {
    uri: 'mongodb://localhost:27017/task-management-dev'
  },

  logging: {
    level: 'debug',
    format: 'dev'
  },

  features: {
    swagger: true,
    playground: true,
    detailedErrors: true
  },

  security: {
    rateLimit: {
      windowMs: 900000, // 15 minutes
      maxRequests: 1000 // More lenient for development
    }
  }
};
