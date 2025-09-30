# Configuration Module

This directory contains all configuration files for the Task Management API.

## Files

### `config.js`
Main configuration module that loads and validates environment variables. It provides:
- Environment variable validation
- Type parsing (integers, booleans)
- Structured configuration object
- Development logging

### `db.js`
Database connection module that handles:
- MongoDB connection with retry logic
- Connection event handlers
- Graceful shutdown
- Connection status monitoring

### `environments/`
Environment-specific configuration overrides:
- `development.js` - Development settings
- `production.js` - Production settings
- `test.js` - Test environment settings

## Configuration Structure

```javascript
{
  server: {
    port: 3000,
    env: 'development',
    apiVersion: 'v1',
    isDevelopment: true,
    isProduction: false,
    isTest: false
  },
  database: {
    uri: 'mongodb://localhost:27017/task-management',
    options: { ... }
  },
  jwt: {
    secret: 'your-secret',
    expiresIn: '1d',
    algorithm: 'HS256',
    refreshSecret: 'your-refresh-secret',
    refreshExpiresIn: '7d'
  },
  security: {
    bcryptRounds: 10,
    rateLimit: { ... },
    cors: { ... }
  },
  logging: {
    level: 'debug',
    format: 'dev'
  },
  app: {
    pagination: { ... },
    upload: { ... }
  },
  features: {
    swagger: true,
    playground: true,
    compression: true,
    trustProxy: true
  }
}
```

## Environment Variables

All environment variables should be defined in the `.env` file. See `.env.example` for a complete list.

### Required Variables
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `REFRESH_TOKEN_SECRET` - Secret key for refresh tokens (min 32 characters)
- `MONGODB_URI` - MongoDB connection string

### Optional Variables
All other variables have sensible defaults.

## Usage

```javascript
const config = require('./config/config');

// Access configuration
console.log(config.server.port);
console.log(config.database.uri);
console.log(config.jwt.secret);

// Check environment
if (config.server.isDevelopment) {
  // Development-specific code
}
```

## Validation

The configuration module automatically validates:
- Required environment variables are present
- JWT secrets are at least 32 characters
- Numeric values are valid integers
- Boolean values are properly parsed

If validation fails, the application will exit with an error message.

## Security Best Practices

1. **Never commit `.env` files** - They contain sensitive data
2. **Use strong secrets** - Generate random strings for JWT secrets
3. **Rotate secrets regularly** - Especially in production
4. **Use different secrets** - Access and refresh tokens should use different secrets
5. **Limit CORS origins** - In production, specify exact allowed origins

## Generating Secure Secrets

Use Node.js crypto module:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use online tools like:
- https://randomkeygen.com/
- https://www.grc.com/passwords.htm
