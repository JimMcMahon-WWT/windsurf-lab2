/**
 * Production environment specific configuration
 */
module.exports = {
  server: {
    port: process.env.PORT || 8080,
    env: 'production'
  },

  logging: {
    level: 'info',
    format: 'combined'
  },

  features: {
    swagger: false,
    playground: false,
    detailedErrors: false,
    compression: true,
    trustProxy: true
  },

  security: {
    rateLimit: {
      windowMs: 900000, // 15 minutes
      maxRequests: 100 // Stricter for production
    },
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
      credentials: true
    }
  }
};
