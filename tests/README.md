# Test Suite Documentation

Comprehensive test suite for the Task Management API using Jest and Supertest.

## Table of Contents
- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Writing Tests](#writing-tests)
- [Test Helpers](#test-helpers)
- [Troubleshooting](#troubleshooting)

---

## Overview

The test suite includes:
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test API endpoints and workflows
- **Mock Data**: Reusable test fixtures
- **Test Helpers**: Utility functions for testing

### Technology Stack
- **Jest**: Test framework
- **Supertest**: HTTP assertion library
- **MongoDB Memory Server**: In-memory MongoDB for testing

---

## Test Structure

```
tests/
├── setup.js                    # Global test setup
├── helpers/
│   ├── testData.js            # Mock data and fixtures
│   └── testHelpers.js         # Helper functions
├── unit/
│   ├── models/
│   │   ├── User.test.js       # User model tests
│   │   └── Task.test.js       # Task model tests
│   ├── utils/
│   │   └── passwordValidator.test.js
│   └── middleware/
│       └── auth.test.js       # Auth middleware tests
└── integration/
    ├── auth.test.js           # Authentication API tests
    └── tasks.test.js          # Task API tests
```

---

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode (Re-run on changes)
```bash
npm run test:watch
```

### With Coverage Report
```bash
npm run test:coverage
```

### Verbose Output
```bash
npm run test:verbose
```

### Run Specific Test File
```bash
npm test -- tests/unit/models/User.test.js
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should create"
```

---

## Test Coverage

### Current Coverage Targets
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

### View Coverage Report
After running `npm run test:coverage`, open:
```
coverage/lcov-report/index.html
```

### Coverage by Component

#### Models
- User model validation
- Password hashing
- Instance methods
- Static methods
- Virtuals

#### Controllers
- Request handling
- Response formatting
- Error handling

#### Services
- Business logic
- Data operations
- Error scenarios

#### Middleware
- Authentication
- Authorization
- Rate limiting
- Error handling

---

## Writing Tests

### Test File Template

```javascript
const { createTestUser } = require('../../helpers/testHelpers');

describe('Feature Name', () => {
  let testUser;

  beforeEach(async () => {
    const result = await createTestUser();
    testUser = result.user;
  });

  describe('Specific Functionality', () => {
    it('should do something', async () => {
      // Arrange
      const input = { ... };

      // Act
      const result = await someFunction(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.property).toBe(expectedValue);
    });
  });
});
```

### Best Practices

1. **Use Descriptive Test Names**
   ```javascript
   // Good
   it('should reject password without uppercase letter', ...)
   
   // Bad
   it('test password', ...)
   ```

2. **Follow AAA Pattern**
   - **Arrange**: Set up test data
   - **Act**: Execute the code being tested
   - **Assert**: Verify the results

3. **Test One Thing Per Test**
   ```javascript
   // Good
   it('should create user', ...)
   it('should hash password', ...)
   
   // Bad
   it('should create user and hash password and send email', ...)
   ```

4. **Use beforeEach for Setup**
   ```javascript
   beforeEach(async () => {
     // Setup code that runs before each test
   });
   ```

5. **Clean Up After Tests**
   ```javascript
   afterEach(async () => {
     // Cleanup code
   });
   ```

---

## Test Helpers

### Creating Test Users

```javascript
const { createTestUser } = require('./helpers/testHelpers');

const { user, token } = await createTestUser();
```

### Creating Test Tasks

```javascript
const { createTestTask } = require('./helpers/testHelpers');

const task = await createTestTask(userId, {
  title: 'Test Task',
  status: 'todo'
});
```

### Making Authenticated Requests

```javascript
const { authenticatedRequest } = require('./helpers/testHelpers');

const response = await authenticatedRequest('get', '/api/v1/tasks', token);
```

### Using Mock Data

```javascript
const { validUser, validTask } = require('./helpers/testData');

const response = await registerUser(validUser);
```

### Generating Multiple Items

```javascript
const { generateTasks } = require('./helpers/testData');

const tasks = generateTasks(10, userId);
```

---

## Unit Tests

### Model Tests

**User Model** (`tests/unit/models/User.test.js`)
- Validation rules
- Password hashing
- Instance methods (comparePassword, incLoginAttempts, etc.)
- Static methods (findByIdentifier, getActiveUsersCount)
- Virtuals (profileUrl, isLocked)
- JSON serialization

**Task Model** (`tests/unit/models/Task.test.js`)
- Validation rules
- Middleware hooks (auto-assign, completedAt)
- Instance methods (complete, cancel, addSubtask, etc.)
- Static methods (findOverdue, getStatistics, etc.)
- Virtuals (isOverdue, isDueSoon, subtaskProgress)

### Utility Tests

**Password Validator** (`tests/unit/utils/passwordValidator.test.js`)
- Password strength validation
- Password scoring
- Password generation

### Middleware Tests

**Auth Middleware** (`tests/unit/middleware/auth.test.js`)
- Token verification
- User authentication
- Role-based access control
- Optional authentication

---

## Integration Tests

### Authentication Tests

**Auth API** (`tests/integration/auth.test.js`)
- User registration
- User login
- Token refresh
- Get current user
- Rate limiting
- Edge cases

**Test Coverage:**
- ✅ Valid registration
- ✅ Duplicate email/username
- ✅ Password validation
- ✅ Login with email/username
- ✅ Failed login attempts
- ✅ Account locking
- ✅ Token refresh
- ✅ Rate limiting

### Task Tests

**Task API** (`tests/integration/tasks.test.js`)
- Create task
- List tasks with pagination
- Get single task
- Update task
- Delete task
- Search tasks
- Bulk operations
- Statistics

**Test Coverage:**
- ✅ CRUD operations
- ✅ Pagination
- ✅ Filtering (status, priority, category, tags)
- ✅ Sorting
- ✅ Search
- ✅ Owner verification
- ✅ Bulk update/delete
- ✅ Edge cases

---

## Test Data

### Valid User Data
```javascript
{
  username: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
  password: 'SecureP@ss123!'
}
```

### Valid Task Data
```javascript
{
  title: 'Test Task',
  description: 'This is a test task',
  status: 'todo',
  priority: 'medium',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
}
```

### Invalid Data Examples
Available in `tests/helpers/testData.js`:
- `invalidUsers.noUsername`
- `invalidUsers.weakPassword`
- `invalidTasks.noTitle`
- `invalidTasks.invalidStatus`

---

## Common Test Patterns

### Testing Success Cases
```javascript
it('should create a task', async () => {
  const response = await authenticatedRequest('post', '/api/v1/tasks', token)
    .send(validTask);

  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);
  expect(response.body.data).toBeDefined();
});
```

### Testing Validation Errors
```javascript
it('should fail without title', async () => {
  const response = await authenticatedRequest('post', '/api/v1/tasks', token)
    .send({ description: 'No title' });

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toContain('required');
});
```

### Testing Authentication
```javascript
it('should fail without authentication', async () => {
  const response = await request(app)
    .get('/api/v1/tasks');

  expect(response.status).toBe(401);
});
```

### Testing Authorization
```javascript
it('should not allow access to other user\'s task', async () => {
  const otherUser = await createTestUser({ ... });
  const otherTask = await createTestTask(otherUser.user._id);

  const response = await authenticatedRequest('get', `/api/v1/tasks/${otherTask._id}`, token);

  expect(response.status).toBe(404);
});
```

---

## Troubleshooting

### Tests Timing Out

**Problem**: Tests exceed 30-second timeout

**Solution**:
```javascript
// Increase timeout for specific test
it('should handle long operation', async () => {
  // test code
}, 60000); // 60 seconds

// Or in describe block
describe('Slow tests', () => {
  jest.setTimeout(60000);
  // tests
});
```

### MongoDB Connection Issues

**Problem**: Cannot connect to MongoDB

**Solution**: Ensure MongoDB Memory Server is installed:
```bash
npm install --save-dev mongodb-memory-server
```

### Port Already in Use

**Problem**: EADDRINUSE error

**Solution**: Tests use in-memory database, no port needed. If issue persists:
```bash
# Kill process using port
npx kill-port 3000
```

### Tests Failing Randomly

**Problem**: Intermittent failures

**Solution**: Use `--runInBand` flag (already in npm scripts):
```bash
npm test -- --runInBand
```

### Memory Leaks

**Problem**: Jest detects open handles

**Solution**: Ensure proper cleanup:
```javascript
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

### Rate Limit Tests Failing

**Problem**: Rate limit tests timeout or fail

**Solution**: Increase timeout for rate limit tests:
```javascript
it('should enforce rate limit', async () => {
  // test code
}, 40000); // 40 seconds
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v2
```

---

## Performance Tips

1. **Use `--runInBand`**: Runs tests serially (required for our setup)
2. **Use `.lean()`**: For read-only queries in tests
3. **Minimize Database Operations**: Use test helpers
4. **Clean Up**: Clear database between tests
5. **Mock External Services**: Don't make real API calls

---

## Test Checklist

When adding new features, ensure:

- [ ] Unit tests for models
- [ ] Unit tests for utilities
- [ ] Unit tests for middleware
- [ ] Integration tests for API endpoints
- [ ] Test success cases
- [ ] Test validation errors
- [ ] Test authentication/authorization
- [ ] Test edge cases
- [ ] Update test documentation
- [ ] Maintain >80% coverage

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://testingjavascript.com/)

---

## Example Test Run

```bash
$ npm test

 PASS  tests/unit/models/User.test.js
 PASS  tests/unit/models/Task.test.js
 PASS  tests/unit/utils/passwordValidator.test.js
 PASS  tests/unit/middleware/auth.test.js
 PASS  tests/integration/auth.test.js
 PASS  tests/integration/tasks.test.js

Test Suites: 6 passed, 6 total
Tests:       120 passed, 120 total
Snapshots:   0 total
Time:        45.234 s
```
