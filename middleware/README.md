# Middleware Documentation

This directory contains all custom middleware for the Task Management API.

## Available Middleware

### Authentication Middleware (`auth.js`)

#### `protect`
Protects routes by requiring valid JWT authentication.

**Features:**
- Verifies JWT token from Authorization header or cookies
- Checks if user exists and is active
- Validates password hasn't changed after token issued
- Checks if account is locked
- Provides detailed error messages

**Usage:**
```javascript
router.get('/tasks', protect, taskController.getTasks);
```

#### `restrictTo(...roles)`
Restricts access to specific user roles.

**Usage:**
```javascript
router.delete('/users/:id', protect, restrictTo('admin'), userController.deleteUser);
```

#### `optionalAuth`
Attaches user to request if valid token exists, but doesn't require authentication.

**Usage:**
```javascript
router.get('/public', optionalAuth, publicController.getData);
```

#### `requireEmailVerification`
Requires user to have verified their email address.

**Usage:**
```javascript
router.post('/premium', protect, requireEmailVerification, premiumController.access);
```

---

### Rate Limiting Middleware (`rateLimiter.js`)

#### `apiLimiter`
General rate limiter for all API routes.

**Configuration:**
- Window: 15 minutes (configurable)
- Max requests: 100 (configurable)

**Usage:**
```javascript
app.use('/api', apiLimiter);
```

#### `authLimiter`
Strict rate limiter for authentication endpoints.

**Configuration:**
- Window: 15 minutes
- Max requests: 5 per IP
- Skips successful requests

**Usage:**
```javascript
router.post('/login', authLimiter, authController.login);
```

#### `registerLimiter`
Rate limiter for user registration.

**Configuration:**
- Window: 1 hour
- Max requests: 3 per IP

**Usage:**
```javascript
router.post('/register', registerLimiter, authController.register);
```

#### `passwordResetLimiter`
Rate limiter for password reset requests.

**Configuration:**
- Window: 1 hour
- Max requests: 3 per IP

**Usage:**
```javascript
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
```

#### `createTaskLimiter`
Rate limiter for task creation.

**Configuration:**
- Window: 1 minute
- Max requests: 20 per IP

**Usage:**
```javascript
router.post('/tasks', protect, createTaskLimiter, taskController.createTask);
```

---

### Error Handler Middleware (`errorHandler.js`)

#### `errorHandler`
Global error handling middleware that catches all errors.

**Features:**
- Handles Mongoose validation errors
- Handles MongoDB duplicate key errors
- Handles JWT errors
- Provides detailed errors in development
- Sanitizes errors in production

**Usage:**
```javascript
// Must be last middleware
app.use(errorHandler);
```

#### `notFound`
Handles 404 errors for undefined routes.

**Usage:**
```javascript
app.use(errorHandler.notFound);
app.use(errorHandler);
```

---

## Middleware Chain Order

The order of middleware is crucial. Here's the recommended order:

```javascript
const express = require('express');
const app = express();

// 1. Security middleware
app.use(helmet());
app.use(cors());

// 2. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Logging
app.use(morgan('dev'));

// 4. Rate limiting (optional - can be applied per route)
app.use('/api', apiLimiter);

// 5. Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// 6. 404 handler
app.use(errorHandler.notFound);

// 7. Global error handler (must be last)
app.use(errorHandler);
```

---

## Creating Custom Middleware

### Basic Structure

```javascript
const customMiddleware = (req, res, next) => {
  try {
    // Your logic here
    
    // Call next() to continue to next middleware
    next();
  } catch (error) {
    // Pass errors to error handler
    next(error);
  }
};

module.exports = customMiddleware;
```

### Async Middleware

```javascript
const asyncMiddleware = async (req, res, next) => {
  try {
    // Async operations
    const data = await someAsyncOperation();
    req.customData = data;
    
    next();
  } catch (error) {
    next(error);
  }
};
```

### Middleware with Parameters

```javascript
const parameterizedMiddleware = (param1, param2) => {
  return (req, res, next) => {
    // Use param1 and param2
    if (req.user.role === param1) {
      next();
    } else {
      next(new Error('Unauthorized'));
    }
  };
};

// Usage
router.get('/admin', parameterizedMiddleware('admin', 'superadmin'), handler);
```

---

## Best Practices

1. **Always call next()**
   - Either `next()` to continue
   - Or `next(error)` to handle errors
   - Never leave hanging requests

2. **Use try-catch for async**
   - Wrap async operations in try-catch
   - Pass errors to next()

3. **Keep middleware focused**
   - Each middleware should do one thing
   - Compose multiple middleware for complex logic

4. **Order matters**
   - Authentication before authorization
   - Validation before business logic
   - Error handler must be last

5. **Document your middleware**
   - Clear comments
   - Usage examples
   - Parameter descriptions

---

## Testing Middleware

### Unit Testing Example

```javascript
const { protect } = require('./auth');
const jwt = require('jsonwebtoken');

describe('Auth Middleware', () => {
  it('should authenticate valid token', async () => {
    const req = {
      headers: {
        authorization: 'Bearer validtoken'
      }
    };
    const res = {};
    const next = jest.fn();
    
    await protect(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });
  
  it('should reject invalid token', async () => {
    const req = {
      headers: {
        authorization: 'Bearer invalidtoken'
      }
    };
    const res = {};
    const next = jest.fn();
    
    await protect(req, res, next);
    
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
```

---

## Troubleshooting

### Middleware not executing
- Check middleware order
- Ensure previous middleware calls next()
- Check for errors in middleware

### Rate limit not working
- Verify rate limiter is applied to route
- Check if behind proxy (trust proxy setting)
- Verify configuration values

### Authentication failing
- Check token format (Bearer <token>)
- Verify JWT secret matches
- Check token expiration
- Ensure user exists and is active

---

## Performance Considerations

1. **Minimize database queries**
   - Cache frequently accessed data
   - Use select() to limit fields

2. **Async operations**
   - Use Promise.all() for parallel operations
   - Avoid blocking operations

3. **Rate limiting**
   - Use Redis for distributed rate limiting
   - Configure appropriate limits

4. **Error handling**
   - Don't expose sensitive information
   - Log errors for debugging
   - Use appropriate status codes
