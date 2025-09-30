# Authentication Guide

Complete guide for JWT authentication in the Task Management API.

## Table of Contents
- [Overview](#overview)
- [Registration](#registration)
- [Login](#login)
- [Token Management](#token-management)
- [Password Requirements](#password-requirements)
- [Rate Limiting](#rate-limiting)
- [Security Features](#security-features)
- [Protected Routes](#protected-routes)

---

## Overview

The API uses **JWT (JSON Web Tokens)** for authentication with the following features:

- ✅ Secure password hashing with bcrypt
- ✅ Strong password requirements
- ✅ JWT access tokens (short-lived)
- ✅ Refresh tokens (long-lived)
- ✅ Account locking after failed attempts
- ✅ Rate limiting on auth endpoints
- ✅ Email verification support
- ✅ Password change detection

---

## Registration

### Endpoint
```
POST /api/v1/auth/register
```

### Request Body
```json
{
  "username": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecureP@ssw0rd!"
}
```

### Password Requirements

Passwords must meet the following criteria:

1. **Minimum 8 characters** (maximum 128)
2. **At least one uppercase letter** (A-Z)
3. **At least one lowercase letter** (a-z)
4. **At least one number** (0-9)
5. **At least one special character** (!@#$%^&*()_+-=[]{};\':"|,.<>?/)
6. **No common passwords** (password123, qwerty, etc.)
7. **No sequential characters** (abc, 123, etc.)
8. **No repeated characters** (aaa, 111, etc.)

### Response (Success)
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "isEmailVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Response (Validation Error)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

### Rate Limiting
- **3 registrations per hour** per IP address

---

## Login

### Endpoint
```
POST /api/v1/auth/login
```

### Request Body
You can login with either **email** or **username**:

```json
{
  "identifier": "johndoe",
  "password": "SecureP@ssw0rd!"
}
```

Or (legacy format):
```json
{
  "email": "john@example.com",
  "password": "SecureP@ssw0rd!"
}
```

### Response (Success)
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "name": "John Doe",
      "email": "john@example.com",
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Response (Invalid Credentials)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Response (Account Locked)
```json
{
  "success": false,
  "message": "Account is temporarily locked due to too many failed login attempts. Please try again later."
}
```

### Account Locking
- **5 failed login attempts** locks account for **2 hours**
- Counter resets on successful login
- Locked accounts cannot login until lock expires

### Rate Limiting
- **5 login attempts per 15 minutes** per IP address
- Successful logins don't count toward limit

---

## Token Management

### Access Tokens
- **Short-lived** (default: 1 day)
- Used for API authentication
- Include in Authorization header: `Bearer <token>`

### Refresh Tokens
- **Long-lived** (default: 7 days)
- Used to obtain new access tokens
- Stored securely on the server

### Refresh Access Token

#### Endpoint
```
POST /api/v1/auth/refresh
```

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User

#### Endpoint
```
GET /api/v1/auth/me
```

#### Headers
```
Authorization: Bearer <token>
```

#### Response
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "bio": "",
    "isActive": true,
    "isEmailVerified": false,
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "preferences": {
      "theme": "auto",
      "notifications": {
        "email": true,
        "push": true
      },
      "language": "en"
    }
  }
}
```

---

## Password Requirements

### Strength Levels

The API calculates password strength on a scale of 0-100:

- **0-39**: Weak (rejected)
- **40-69**: Medium (accepted)
- **70-89**: Strong (accepted)
- **90-100**: Very Strong (accepted)

### Password Validation Examples

#### ✅ Valid Passwords
```
SecureP@ssw0rd!
MyStr0ng#Pass
C0mpl3x!ty2024
```

#### ❌ Invalid Passwords
```
password123      // Too common
12345678         // No letters, too simple
abcdefgh         // No numbers or special chars
Password         // No numbers or special chars
PASS123!         // No lowercase letters
pass123!         // No uppercase letters
```

### Generate Strong Password

Use the utility function to generate secure passwords:

```javascript
const { generateStrongPassword } = require('./utils/passwordValidator');

const password = generateStrongPassword(16);
console.log(password); // e.g., "K7#mP2@nQ9$xL4&w"
```

---

## Rate Limiting

### Authentication Endpoints

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `/auth/register` | 3 requests | 1 hour | Per IP |
| `/auth/login` | 5 requests | 15 minutes | Per IP, successful logins excluded |
| `/auth/refresh` | 5 requests | 15 minutes | Per IP |
| `/tasks` (POST) | 20 requests | 1 minute | Per IP |

### Rate Limit Headers

The API includes rate limit information in response headers:

```
RateLimit-Limit: 5
RateLimit-Remaining: 4
RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "message": "Too many login attempts from this IP, please try again after 15 minutes"
}
```

---

## Security Features

### 1. Password Hashing
- Uses **bcrypt** with configurable rounds (default: 10)
- Passwords never stored in plain text
- Automatic hashing on user creation/update

### 2. JWT Security
- Tokens signed with secure secret keys
- Configurable expiration times
- Algorithm: HS256 (HMAC with SHA-256)

### 3. Account Protection
- **Account locking** after failed attempts
- **Password change detection** invalidates old tokens
- **Inactive account** checks
- **Email verification** support

### 4. Token Validation
- Verifies token signature
- Checks token expiration
- Validates user still exists
- Ensures user is active
- Detects password changes

### 5. Rate Limiting
- IP-based rate limiting
- Different limits for different endpoints
- Prevents brute force attacks
- Prevents spam registrations

### 6. Input Validation
- Strong password requirements
- Email format validation
- Username format validation
- SQL injection prevention
- XSS prevention

---

## Protected Routes

### Using Authentication

All protected routes require a valid JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/tasks
```

### Middleware Functions

#### `protect`
Requires valid JWT token and active user:

```javascript
router.get('/tasks', protect, taskController.getTasks);
```

#### `restrictTo(...roles)`
Restricts access to specific roles:

```javascript
router.delete('/users/:id', protect, restrictTo('admin'), userController.deleteUser);
```

#### `optionalAuth`
Attaches user if token is valid, but doesn't require it:

```javascript
router.get('/public', optionalAuth, publicController.getData);
```

#### `requireEmailVerification`
Requires user to have verified email:

```javascript
router.post('/premium', protect, requireEmailVerification, premiumController.access);
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route. Please login."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Your account has been deactivated. Please contact support."
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many login attempts from this IP, please try again after 15 minutes"
}
```

---

## Best Practices

### For Clients

1. **Store tokens securely**
   - Use httpOnly cookies or secure storage
   - Never store in localStorage for sensitive apps

2. **Handle token expiration**
   - Implement automatic token refresh
   - Redirect to login on 401 errors

3. **Include tokens in requests**
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

4. **Logout properly**
   - Clear stored tokens
   - Invalidate refresh tokens on server

### For Developers

1. **Use environment variables**
   - Never hardcode JWT secrets
   - Use strong, random secrets (32+ characters)

2. **Configure appropriate expiration**
   - Short access tokens (15min - 1 day)
   - Longer refresh tokens (7-30 days)

3. **Monitor failed attempts**
   - Log suspicious activity
   - Alert on unusual patterns

4. **Keep dependencies updated**
   - Regular security updates
   - Monitor vulnerability reports

---

## Testing Authentication

### PowerShell Examples

#### Register
```powershell
$body = @{
    username = "testuser"
    name = "Test User"
    email = "test@example.com"
    password = "SecureP@ss123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

#### Login
```powershell
$body = @{
    identifier = "testuser"
    password = "SecureP@ss123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$token = $response.data.token
```

#### Access Protected Route
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/me" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $token" }
```

---

## Troubleshooting

### "Invalid token"
- Token may be expired
- Token may be malformed
- JWT secret may have changed
- Solution: Login again to get new token

### "Account is temporarily locked"
- Too many failed login attempts
- Wait 2 hours or contact admin
- Solution: Wait for lock to expire

### "Password is too weak"
- Password doesn't meet requirements
- Check all password criteria
- Solution: Use stronger password

### "Too many requests"
- Rate limit exceeded
- Wait for rate limit window to reset
- Solution: Implement exponential backoff

---

## Configuration

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_at_least_32_characters_long
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your_refresh_secret_different_from_jwt_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generating Secrets

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Security Checklist

- ✅ Strong password requirements enforced
- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens with expiration
- ✅ Refresh token mechanism
- ✅ Rate limiting on auth endpoints
- ✅ Account locking after failed attempts
- ✅ Password change detection
- ✅ Active account verification
- ✅ Input validation and sanitization
- ✅ Secure token storage (select: false)
- ✅ HTTPS recommended for production
- ✅ CORS configuration
- ✅ Security headers (Helmet)

---

## Additional Resources

- [JWT.io](https://jwt.io/) - JWT debugger and documentation
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [bcrypt Documentation](https://www.npmjs.com/package/bcryptjs)
