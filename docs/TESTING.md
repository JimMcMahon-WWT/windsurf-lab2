# Testing Guide

Quick guide for testing the Task Management API.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run with Coverage
```bash
npm run test:coverage
```

---

## Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:verbose` | Run tests with verbose output |

---

## Test Structure

### Unit Tests (120+ tests)
- **User Model**: 25 tests
  - Validation, password hashing, methods, virtuals
- **Task Model**: 30 tests
  - Validation, hooks, methods, virtuals, statistics
- **Password Validator**: 20 tests
  - Strength validation, scoring, generation
- **Auth Middleware**: 15 tests
  - Token verification, authorization, optional auth

### Integration Tests (80+ tests)
- **Authentication API**: 40 tests
  - Registration, login, token refresh, rate limiting
- **Task API**: 40 tests
  - CRUD operations, pagination, filtering, search, bulk operations

**Total: 200+ tests**

---

## Coverage Targets

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

---

## Test Examples

### Running Specific Tests

```bash
# Run only User model tests
npm test -- tests/unit/models/User.test.js

# Run only authentication integration tests
npm test -- tests/integration/auth.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should create"
```

### Watch Mode

```bash
# Re-run tests on file changes
npm run test:watch
```

### Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

---

## What's Tested

### Models
✅ Field validation
✅ Required fields
✅ Unique constraints
✅ Data types
✅ Min/max lengths
✅ Enum values
✅ Custom validators
✅ Default values
✅ Password hashing
✅ Instance methods
✅ Static methods
✅ Virtuals
✅ Middleware hooks
✅ JSON serialization

### API Endpoints
✅ Success responses
✅ Error responses
✅ Status codes
✅ Authentication
✅ Authorization
✅ Input validation
✅ Pagination
✅ Filtering
✅ Sorting
✅ Search
✅ Rate limiting
✅ Edge cases

### Utilities
✅ Password validation
✅ Password strength scoring
✅ Password generation
✅ Error handling

### Middleware
✅ JWT verification
✅ Token expiration
✅ User authentication
✅ Role-based access
✅ Optional authentication
✅ Error handling

---

## Test Data

### Valid User
```javascript
{
  username: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
  password: 'SecureP@ss123!'
}
```

### Valid Task
```javascript
{
  title: 'Test Task',
  description: 'Task description',
  status: 'todo',
  priority: 'medium',
  dueDate: '2024-12-31'
}
```

---

## Common Issues

### Tests Timing Out
Increase timeout in jest.config.js or specific test:
```javascript
it('test name', async () => {
  // test code
}, 60000); // 60 seconds
```

### MongoDB Connection
Tests use in-memory MongoDB (no setup required)

### Port Conflicts
Tests don't start a server (use supertest)

---

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run tests
  run: npm run test:coverage
```

### GitLab CI
```yaml
test:
  script:
    - npm ci
    - npm run test:coverage
```

---

## Best Practices

1. ✅ Write tests for new features
2. ✅ Test success and error cases
3. ✅ Test edge cases
4. ✅ Maintain >80% coverage
5. ✅ Use descriptive test names
6. ✅ Follow AAA pattern (Arrange, Act, Assert)
7. ✅ Keep tests independent
8. ✅ Clean up after tests
9. ✅ Use test helpers
10. ✅ Mock external dependencies

---

## Example Output

```bash
$ npm test

PASS tests/unit/models/User.test.js (8.234 s)
  User Model
    Validation
      ✓ should create a valid user (45 ms)
      ✓ should fail without username (12 ms)
      ✓ should fail with short username (10 ms)
      ✓ should fail with invalid email (11 ms)
      ✓ should fail with duplicate email (23 ms)
    Password Hashing
      ✓ should hash password before saving (156 ms)
      ✓ should not rehash password if not modified (89 ms)
      ✓ should compare password correctly (178 ms)

PASS tests/unit/models/Task.test.js (7.891 s)
PASS tests/unit/utils/passwordValidator.test.js (2.123 s)
PASS tests/unit/middleware/auth.test.js (5.456 s)
PASS tests/integration/auth.test.js (12.345 s)
PASS tests/integration/tasks.test.js (15.678 s)

Test Suites: 6 passed, 6 total
Tests:       200 passed, 200 total
Snapshots:   0 total
Time:        51.727 s

Coverage:
  Statements   : 85.23% ( 1234/1448 )
  Branches     : 78.45% ( 456/581 )
  Functions    : 82.67% ( 234/283 )
  Lines        : 85.12% ( 1198/1407 )
```

---

## Resources

- [Full Test Documentation](../tests/README.md)
- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
