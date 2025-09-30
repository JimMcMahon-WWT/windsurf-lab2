/**
 * Test data generators and fixtures
 */

// Valid user data
const validUser = {
  username: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
  password: 'SecureP@ss123!'
};

const validUser2 = {
  username: 'testuser2',
  name: 'Test User 2',
  email: 'test2@example.com',
  password: 'SecureP@ss456!'
};

// Invalid user data
const invalidUsers = {
  noUsername: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'SecureP@ss123!'
  },
  shortUsername: {
    username: 'ab',
    name: 'Test User',
    email: 'test@example.com',
    password: 'SecureP@ss123!'
  },
  invalidEmail: {
    username: 'testuser',
    name: 'Test User',
    email: 'invalid-email',
    password: 'SecureP@ss123!'
  },
  weakPassword: {
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    password: 'weak'
  },
  noUppercase: {
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    password: 'securepass123!'
  },
  noNumber: {
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    password: 'SecurePass!'
  },
  noSpecialChar: {
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    password: 'SecurePass123'
  }
};

// Valid task data
const validTask = {
  title: 'Test Task',
  description: 'This is a test task',
  status: 'todo',
  priority: 'medium',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
};

const validTask2 = {
  title: 'Another Test Task',
  description: 'This is another test task',
  status: 'in-progress',
  priority: 'high',
  dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  tags: ['urgent', 'important'],
  category: 'work'
};

// Invalid task data
const invalidTasks = {
  noTitle: {
    description: 'Task without title',
    status: 'todo'
  },
  invalidStatus: {
    title: 'Test Task',
    status: 'invalid-status'
  },
  invalidPriority: {
    title: 'Test Task',
    priority: 'invalid-priority'
  },
  pastDueDate: {
    title: 'Test Task',
    dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  }
};

// Generate multiple tasks
const generateTasks = (count, userId) => {
  const tasks = [];
  const statuses = ['todo', 'in-progress', 'completed', 'cancelled'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  
  for (let i = 0; i < count; i++) {
    tasks.push({
      title: `Task ${i + 1}`,
      description: `Description for task ${i + 1}`,
      status: statuses[i % statuses.length],
      priority: priorities[i % priorities.length],
      dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
      createdBy: userId,
      tags: [`tag${i % 3}`, `category${i % 2}`],
      category: `category${i % 3}`
    });
  }
  
  return tasks;
};

// Generate overdue tasks
const generateOverdueTasks = (count, userId) => {
  const tasks = [];
  
  for (let i = 0; i < count; i++) {
    tasks.push({
      title: `Overdue Task ${i + 1}`,
      description: `Overdue task description ${i + 1}`,
      status: 'todo',
      priority: 'high',
      dueDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000), // Past dates
      createdBy: userId
    });
  }
  
  return tasks;
};

module.exports = {
  validUser,
  validUser2,
  invalidUsers,
  validTask,
  validTask2,
  invalidTasks,
  generateTasks,
  generateOverdueTasks
};
