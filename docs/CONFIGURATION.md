# Configuration Guide

Complete guide for configuring the Task Management API.

## Table of Contents
- [Environment Variables](#environment-variables)
- [Configuration Structure](#configuration-structure)
- [Environment-Specific Settings](#environment-specific-settings)
- [Security Configuration](#security-configuration)
- [Database Configuration](#database-configuration)

## Environment Variables

### Server Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORT` | number | 3000 | Server port |
| `NODE_ENV` | string | development | Environment (development/production/test) |
| `API_VERSION` | string | v1 | API version prefix |

### Database Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `MONGODB_URI` | string | **Required** | MongoDB connection string |
| `MONGODB_MAX_POOL_SIZE` | number | 10 | Maximum connection pool size |
| `MONGODB_MIN_POOL_SIZE` | number | 2 | Minimum connection pool size |
| `MONGODB_CONNECT_TIMEOUT_MS` | number | 10000 | Connection timeout in milliseconds |
| `MONGODB_SOCKET_TIMEOUT_MS` | number | 45000 | Socket timeout in milliseconds |

### JWT Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `JWT_SECRET` | string | **Required** | Secret key for access tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | string | 1d | Access token expiration time |
| `JWT_ALGORITHM` | string | HS256 | JWT signing algorithm |
| `REFRESH_TOKEN_SECRET` | string | **Required** | Secret key for refresh tokens (min 32 chars) |
| `REFRESH_TOKEN_EXPIRES_IN` | string | 7d | Refresh token expiration time |

### Security Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `BCRYPT_ROUNDS` | number | 10 | Number of bcrypt hashing rounds |
| `RATE_LIMIT_WINDOW_MS` | number | 900000 | Rate limit window (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | number | 100 | Max requests per window |
| `CORS_ORIGIN` | string | * | Allowed CORS origins |
| `CORS_CREDENTIALS` | boolean | true | Allow credentials in CORS |

### Logging Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `LOG_LEVEL` | string | debug | Logging level (debug/info/warn/error) |
| `LOG_FORMAT` | string | dev | Morgan logging format |

### Application Settings

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DEFAULT_PAGE_SIZE` | number | 10 | Default pagination page size |
| `MAX_PAGE_SIZE` | number | 100 | Maximum pagination page size |
| `MAX_FILE_SIZE` | number | 5242880 | Maximum file upload size (5MB) |

### Feature Flags

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DEV_ENABLE_SWAGGER` | boolean | true | Enable Swagger documentation |
| `DEV_ENABLE_PLAYGROUND` | boolean | true | Enable GraphQL playground |
| `PROD_ENABLE_COMPRESSION` | boolean | true | Enable response compression |
| `PROD_TRUST_PROXY` | boolean | true | Trust proxy headers |

## Configuration Structure

The configuration is organized into logical sections:

```javascript
const config = require('./config/config');

// Server settings
config.server.port
config.server.env
config.server.isDevelopment
config.server.isProduction

// Database settings
config.database.uri
config.database.options

// JWT settings
config.jwt.secret
config.jwt.expiresIn

// Security settings
config.security.bcryptRounds
config.security.rateLimit
config.security.cors

// Logging settings
config.logging.level
config.logging.format

// App settings
config.app.pagination
config.app.upload

// Feature flags
config.features.swagger
config.features.compression
```

## Environment-Specific Settings

### Development
```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
DEV_ENABLE_SWAGGER=true
```

### Production
```env
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
PROD_ENABLE_COMPRESSION=true
CORS_ORIGIN=https://yourdomain.com
```

### Test
```env
NODE_ENV=test
PORT=3001
MONGODB_URI=mongodb://localhost:27017/task-management-test
BCRYPT_ROUNDS=4
```

## Security Configuration

### JWT Secrets

Generate strong secrets using:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

Example output:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### CORS Configuration

**Development:**
```env
CORS_ORIGIN=*
```

**Production:**
```env
CORS_ORIGIN=https://app.example.com,https://admin.example.com
```

### Rate Limiting

Adjust based on your needs:

```env
# Strict (production)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Lenient (development)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

## Database Configuration

### Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/task-management
```

### Docker MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/task-management
```

### MongoDB Atlas
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task-management?retryWrites=true&w=majority
```

### Connection Pool Settings

For high-traffic applications:
```env
MONGODB_MAX_POOL_SIZE=50
MONGODB_MIN_POOL_SIZE=10
```

For low-traffic applications:
```env
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
```

## Configuration Validation

The configuration module automatically validates:

1. **Required variables** - Exits if missing
2. **Secret strength** - Warns if JWT secrets < 32 characters
3. **Type checking** - Ensures numbers are valid integers
4. **Boolean parsing** - Handles various boolean formats

## Best Practices

1. **Never commit `.env` files**
2. **Use different secrets for each environment**
3. **Rotate secrets regularly**
4. **Use environment variables in production**
5. **Keep `.env.example` updated**
6. **Document all configuration changes**
7. **Use strong, random secrets**
8. **Limit CORS origins in production**
9. **Enable compression in production**
10. **Use appropriate log levels per environment**

## Troubleshooting

### Configuration Error: Missing required environment variables

**Solution:** Ensure `.env` file exists and contains all required variables:
- JWT_SECRET
- REFRESH_TOKEN_SECRET
- MONGODB_URI

### Warning: JWT_SECRET should be at least 32 characters long

**Solution:** Generate a stronger secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### MongoDB Connection Error

**Solution:** 
1. Verify MongoDB is running
2. Check MONGODB_URI is correct
3. Ensure network connectivity
4. Check firewall settings

## Example Configurations

### Minimal Development Setup
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=dev_secret_at_least_32_characters_long_12345678
REFRESH_TOKEN_SECRET=dev_refresh_secret_at_least_32_characters_long_12345678
```

### Production Setup
```env
PORT=8080
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/task-management
JWT_SECRET=<generated-secret>
REFRESH_TOKEN_SECRET=<generated-secret>
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
BCRYPT_ROUNDS=12
PROD_ENABLE_COMPRESSION=true
```
