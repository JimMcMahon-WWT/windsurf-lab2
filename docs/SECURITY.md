# Security Features

Comprehensive security implementation for the Task Management API.

## Table of Contents
- [Authentication Security](#authentication-security)
- [Password Security](#password-security)
- [Rate Limiting](#rate-limiting)
- [Token Security](#token-security)
- [Account Protection](#account-protection)
- [Input Validation](#input-validation)
- [Security Headers](#security-headers)
- [Best Practices](#best-practices)

---

## Authentication Security

### JWT Implementation

**Features:**
- ✅ HS256 algorithm (HMAC with SHA-256)
- ✅ Configurable token expiration
- ✅ Separate access and refresh tokens
- ✅ Token validation on every request
- ✅ Password change detection

**Token Structure:**
```javascript
{
  id: "user_id",
  iat: 1640995200,  // Issued at
  exp: 1641081600   // Expires at
}
```

**Security Checks:**
1. Token signature verification
2. Token expiration check
3. User existence verification
4. User active status check
5. Password change detection
6. Account lock status check

---

## Password Security

### Hashing

**Implementation:**
- Algorithm: bcrypt
- Rounds: 10 (configurable)
- Automatic hashing on save
- Never stored in plain text

**Code Example:**
```javascript
// Automatic hashing in User model
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, config.security.bcryptRounds);
  next();
});
```

### Strong Password Requirements

**Minimum Requirements:**
- ✅ 8 characters minimum (128 maximum)
- ✅ At least 1 uppercase letter
- ✅ At least 1 lowercase letter
- ✅ At least 1 number
- ✅ At least 1 special character
- ✅ No common passwords
- ✅ No sequential characters
- ✅ No repeated characters

**Password Strength Scoring:**
- 0-39: Weak (rejected)
- 40-69: Medium (accepted)
- 70-89: Strong (accepted)
- 90-100: Very Strong (accepted)

**Validation Function:**
```javascript
const { validatePasswordStrength } = require('./utils/passwordValidator');

const result = validatePasswordStrength('MyP@ssw0rd');
// { isValid: true, errors: [] }
```

---

## Rate Limiting

### Implementation

Uses `express-rate-limit` package with IP-based tracking.

### Endpoint Limits

| Endpoint | Window | Max Requests | Notes |
|----------|--------|--------------|-------|
| `/auth/register` | 1 hour | 3 | Per IP |
| `/auth/login` | 15 min | 5 | Successful excluded |
| `/auth/refresh` | 15 min | 5 | Per IP |
| `/tasks` (POST) | 1 min | 20 | Per IP |
| General API | 15 min | 100 | Configurable |

### Rate Limit Headers

```http
RateLimit-Limit: 5
RateLimit-Remaining: 4
RateLimit-Reset: 1640995200
```

### Configuration

```javascript
// config/.env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Token Security

### Access Tokens

**Characteristics:**
- Short-lived (default: 1 day)
- Used for API authentication
- Invalidated on password change
- Stored in Authorization header

**Usage:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Refresh Tokens

**Characteristics:**
- Long-lived (default: 7 days)
- Used to obtain new access tokens
- Stored securely in database
- One per user (rotating)

**Security Measures:**
1. Stored with `select: false` in database
2. Validated against stored token
3. Rotated on each use
4. Invalidated on logout

### Token Validation

```javascript
// Middleware checks:
1. Token exists
2. Token signature valid
3. Token not expired
4. User exists
5. User is active
6. Password not changed after token issued
7. Account not locked
```

---

## Account Protection

### Failed Login Attempts

**Mechanism:**
- Counter increments on failed login
- Counter resets on successful login
- Account locks after 5 failed attempts
- Lock duration: 2 hours

**Database Fields:**
```javascript
{
  loginAttempts: Number,
  lockUntil: Date
}
```

**Implementation:**
```javascript
// Increment on failed login
await user.incLoginAttempts();

// Reset on successful login
await user.resetLoginAttempts();

// Check if locked
if (user.isLocked) {
  throw ApiError.forbidden('Account locked');
}
```

### Account Status

**Active Status:**
- `isActive: false` prevents login
- Checked on every authenticated request
- Can be toggled by admin

**Email Verification:**
- `isEmailVerified: false` by default
- Optional middleware to require verification
- Tokens stored securely

**Password Change Tracking:**
- `passwordChangedAt` timestamp
- Invalidates tokens issued before change
- Automatic update on password modification

---

## Input Validation

### Validation Layers

1. **Schema Validation (Joi)**
   - Request body validation
   - Type checking
   - Format validation
   - Custom validators

2. **Database Validation (Mongoose)**
   - Field requirements
   - Data types
   - Min/max lengths
   - Custom validators

3. **Business Logic Validation**
   - Service layer checks
   - Authorization checks
   - Data consistency

### Validation Examples

**Username:**
```javascript
username: Joi.string()
  .min(3)
  .max(30)
  .pattern(/^[a-zA-Z0-9_-]+$/)
  .required()
```

**Email:**
```javascript
email: Joi.string()
  .email()
  .required()
```

**Password:**
```javascript
password: Joi.string()
  .min(8)
  .max(128)
  .custom(strongPassword)
  .required()
```

### Sanitization

**Automatic:**
- Trim whitespace
- Lowercase emails/usernames
- Strip unknown fields
- HTML escape (via Helmet)

**Manual:**
```javascript
const sanitized = validator.escape(userInput);
```

---

## Security Headers

### Helmet Configuration

Automatically applied via `helmet()` middleware:

```javascript
app.use(helmet());
```

**Headers Set:**
- `X-DNS-Prefetch-Control: off`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security: max-age=15552000`
- `X-Download-Options: noopen`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 0`

### CORS Configuration

```javascript
app.use(cors({
  origin: config.security.cors.origin,
  credentials: config.security.cors.credentials
}));
```

**Production Settings:**
```env
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true
```

---

## Best Practices

### For Developers

1. **Environment Variables**
   ```env
   # Use strong, random secrets
   JWT_SECRET=<64-char-random-string>
   REFRESH_TOKEN_SECRET=<different-64-char-string>
   ```

2. **Secret Generation**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Never Commit Secrets**
   - Use `.env` files
   - Add `.env` to `.gitignore`
   - Use environment-specific configs

4. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Run `npm audit` regularly

5. **Logging**
   - Log authentication failures
   - Log suspicious activity
   - Don't log sensitive data

### For Production

1. **HTTPS Only**
   ```javascript
   if (config.server.isProduction && !req.secure) {
     return res.redirect('https://' + req.headers.host + req.url);
   }
   ```

2. **Trust Proxy**
   ```javascript
   if (config.features.trustProxy) {
     app.set('trust proxy', 1);
   }
   ```

3. **Rate Limiting**
   - Use Redis for distributed systems
   - Adjust limits based on traffic
   - Monitor for abuse

4. **Database Security**
   - Use connection strings with auth
   - Limit database user permissions
   - Enable MongoDB authentication

5. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor failed login attempts
   - Alert on suspicious patterns

### For API Consumers

1. **Token Storage**
   - Use httpOnly cookies (preferred)
   - Or secure storage (not localStorage)
   - Clear on logout

2. **Token Refresh**
   - Implement automatic refresh
   - Handle 401 errors gracefully
   - Retry failed requests after refresh

3. **Error Handling**
   - Don't expose errors to users
   - Log errors for debugging
   - Show user-friendly messages

4. **HTTPS**
   - Always use HTTPS in production
   - Validate SSL certificates
   - Pin certificates if possible

---

## Security Checklist

### Authentication
- ✅ JWT tokens with expiration
- ✅ Refresh token mechanism
- ✅ Password hashing with bcrypt
- ✅ Strong password requirements
- ✅ Account locking mechanism
- ✅ Password change detection
- ✅ Email verification support

### Authorization
- ✅ Route protection middleware
- ✅ Role-based access control
- ✅ Resource ownership checks
- ✅ Active account verification

### Input Validation
- ✅ Request body validation (Joi)
- ✅ Database schema validation (Mongoose)
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ CSRF protection (if using cookies)

### Rate Limiting
- ✅ Authentication endpoint limits
- ✅ API endpoint limits
- ✅ IP-based tracking
- ✅ Configurable limits

### Data Protection
- ✅ Sensitive fields excluded (select: false)
- ✅ Password never returned in responses
- ✅ Tokens stored securely
- ✅ HTTPS recommended

### Headers & CORS
- ✅ Security headers (Helmet)
- ✅ CORS configuration
- ✅ Content-Type validation
- ✅ XSS protection

### Monitoring
- ✅ Error logging
- ✅ Failed login tracking
- ✅ Rate limit monitoring
- ✅ Suspicious activity detection

---

## Vulnerability Prevention

### SQL Injection
**Prevention:**
- Using Mongoose ODM
- Parameterized queries
- Input validation

### XSS (Cross-Site Scripting)
**Prevention:**
- Helmet middleware
- Input sanitization
- Output encoding
- Content Security Policy

### CSRF (Cross-Site Request Forgery)
**Prevention:**
- SameSite cookies
- CSRF tokens (if needed)
- Origin validation

### Brute Force
**Prevention:**
- Rate limiting
- Account locking
- CAPTCHA (optional)
- IP blocking (optional)

### Session Hijacking
**Prevention:**
- Short token expiration
- Secure token storage
- HTTPS only
- Token rotation

---

## Incident Response

### If Compromised

1. **Immediate Actions**
   - Rotate all JWT secrets
   - Invalidate all tokens
   - Force password resets
   - Review access logs

2. **Investigation**
   - Check failed login attempts
   - Review rate limit violations
   - Analyze suspicious patterns
   - Identify affected users

3. **Communication**
   - Notify affected users
   - Document incident
   - Report if required
   - Update security measures

4. **Prevention**
   - Patch vulnerabilities
   - Update dependencies
   - Strengthen security
   - Increase monitoring

---

## Testing Security

### Manual Testing

```bash
# Test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"identifier":"test","password":"wrong"}'
done

# Test weak password
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","name":"Test","email":"test@test.com","password":"weak"}'

# Test invalid token
curl -H "Authorization: Bearer invalid" \
  http://localhost:3000/api/v1/auth/me
```

### Automated Testing

```javascript
describe('Security', () => {
  it('should reject weak passwords', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'test',
        name: 'Test',
        email: 'test@test.com',
        password: 'weak'
      });
    
    expect(res.status).toBe(400);
  });
  
  it('should lock account after failed attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ identifier: 'test', password: 'wrong' });
    }
    
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'test', password: 'correct' });
    
    expect(res.status).toBe(403);
  });
});
```

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
