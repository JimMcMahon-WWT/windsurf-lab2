const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Task = require('../../models/Task');
const { validUser, validUser2 } = require('./testData');

/**
 * Create a test user and return user object with token
 */
const createTestUser = async (userData) => {
  // Generate unique user data if not provided
  const uniqueData = userData || {
    ...validUser,
    username: `testuser${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
    email: `test${Date.now()}${Math.random().toString(36).substr(2, 9)}@example.com`
  };
  
  const user = await User.create(uniqueData);
  const authService = require('../../services/authService');
  const token = authService.generateToken(user._id);
  
  return {
    user,
    token
  };
};

/**
 * Create multiple test users
 */
const createTestUsers = async (count = 2) => {
  const users = [];
  const authService = require('../../services/authService');
  
  for (let i = 0; i < count; i++) {
    const userData = {
      username: `testuser${i}`,
      name: `Test User ${i}`,
      email: `test${i}@example.com`,
      password: 'SecureP@ss123!'
    };
    
    const user = await User.create(userData);
    const token = authService.generateToken(user._id);
    
    users.push({ user, token });
  }
  
  return users;
};

/**
 * Create a test task
 */
const createTestTask = async (userId, taskData = {}) => {
  const defaultTask = {
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    priority: 'medium',
    createdBy: userId
  };
  
  return await Task.create({ ...defaultTask, ...taskData });
};

/**
 * Create multiple test tasks
 */
const createTestTasks = async (userId, count = 5) => {
  const tasks = [];
  
  for (let i = 0; i < count; i++) {
    const task = await createTestTask(userId, {
      title: `Test Task ${i + 1}`,
      description: `Description ${i + 1}`
    });
    tasks.push(task);
  }
  
  return tasks;
};

/**
 * Make authenticated request
 */
const authenticatedRequest = (method, url, token) => {
  return request(app)[method](url).set('Authorization', `Bearer ${token}`);
};

/**
 * Register a user via API
 */
const registerUser = async (userData = validUser) => {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send(userData);
  
  return response;
};

/**
 * Login a user via API
 */
const loginUser = async (identifier, password) => {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ identifier, password });
  
  return response;
};

/**
 * Wait for a specified time (for testing rate limits, etc.)
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Clean up all test data
 */
const cleanupTestData = async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
};

module.exports = {
  createTestUser,
  createTestUsers,
  createTestTask,
  createTestTasks,
  authenticatedRequest,
  registerUser,
  loginUser,
  wait,
  cleanupTestData
};
