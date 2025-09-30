require('dotenv').config();

/**
 * Validate required environment variables
 */
const validateConfig = () => {
  const required = ['JWT_SECRET', 'REFRESH_TOKEN_SECRET', 'MONGODB_URI'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT secrets are strong enough
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  Warning: JWT_SECRET should be at least 32 characters long');
  }

  if (process.env.REFRESH_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET.length < 32) {
    console.warn('⚠️  Warning: REFRESH_TOKEN_SECRET should be at least 32 characters long');
  }
};

/**
 * Parse integer with default value
 */
const parseInt = (value, defaultValue) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Parse boolean with default value
 */
const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue;
  return value === 'true' || value === '1' || value === true;
};

/**
 * Application configuration
 */
const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT, 3000),
    env: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management',
    options: {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE, 10),
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE, 2),
      connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS, 10000),
      socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS, 45000)
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10),
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 900000), // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 100)
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: parseBoolean(process.env.CORS_CREDENTIALS, true)
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    format: process.env.LOG_FORMAT || 'dev'
  },

  // Application Settings
  app: {
    pagination: {
      defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE, 10),
      maxPageSize: parseInt(process.env.MAX_PAGE_SIZE, 100)
    },
    upload: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 5242880) // 5MB
    }
  },

  // Environment-Specific Features
  features: {
    swagger: parseBoolean(process.env.DEV_ENABLE_SWAGGER, true),
    playground: parseBoolean(process.env.DEV_ENABLE_PLAYGROUND, true),
    compression: parseBoolean(process.env.PROD_ENABLE_COMPRESSION, true),
    trustProxy: parseBoolean(process.env.PROD_TRUST_PROXY, true)
  }
};

// Validate configuration on load
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration Error:', error.message);
  process.exit(1);
}

// Log configuration in development
if (config.server.isDevelopment) {
  console.log('📋 Configuration loaded successfully');
  console.log(`   Environment: ${config.server.env}`);
  console.log(`   Port: ${config.server.port}`);
  console.log(`   Database: ${config.database.uri.replace(/\/\/.*@/, '//***@')}`);
}

module.exports = config;
