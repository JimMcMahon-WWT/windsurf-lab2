const request = require('supertest');
const app = require('../../app');
const Task = require('../../models/Task');
const { validTask, validTask2, invalidTasks, generateTasks } = require('../helpers/testData');
const { createTestUser, createTestTask, createTestTasks, authenticatedRequest } = require('../helpers/testHelpers');

describe('Task Integration Tests', () => {
  let testUser, token;

  beforeEach(async () => {
    const result = await createTestUser();
    testUser = result.user;
    token = result.token;
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a new task', async () => {
      const response = await authenticatedRequest('post', '/api/v1/tasks', token)
        .send(validTask);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(validTask.title);
      expect(response.body.data.status).toBe(validTask.status);
      expect(response.body.data.priority).toBe(validTask.priority);
      expect(response.body.data.createdBy).toBe(testUser._id.toString());
    });

    it('should create task with minimal data', async () => {
      const response = await authenticatedRequest('post', '/api/v1/tasks', token)
        .send({ title: 'Minimal Task' });

      expect(response.status).toBe(201);
      expect(response.body.data.status).toBe('todo');
      expect(response.body.data.priority).toBe('medium');
    });

    it('should fail without title', async () => {
      const response = await authenticatedRequest('post', '/api/v1/tasks', token)
        .send(invalidTasks.noTitle);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid status', async () => {
      const response = await authenticatedRequest('post', '/api/v1/tasks', token)
        .send(invalidTasks.invalidStatus);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid priority', async () => {
      const response = await authenticatedRequest('post', '/api/v1/tasks', token)
        .send(invalidTasks.invalidPriority);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .send(validTask);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should create task with tags', async () => {
      const response = await authenticatedRequest('post', '/api/v1/tasks', token)
        .send({
          ...validTask,
          tags: ['urgent', 'important']
        });

      expect(response.status).toBe(201);
      expect(response.body.data.tags).toEqual(['urgent', 'important']);
    });

    it('should create task with category', async () => {
      const response = await authenticatedRequest('post', '/api/v1/tasks', token)
        .send({
          ...validTask,
          category: 'work'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.category).toBe('work');
    });
  });

  describe('GET /api/v1/tasks', () => {
    beforeEach(async () => {
      await createTestTasks(testUser._id, 15);
    });

    it('should get all tasks with pagination', async () => {
      const response = await authenticatedRequest('get', '/api/v1/tasks?page=1&limit=10', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(15);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.totalPages).toBe(2);
      expect(response.body.pagination.hasNextPage).toBe(true);
    });

    it('should get second page of tasks', async () => {
      const response = await authenticatedRequest('get', '/api/v1/tasks?page=2&limit=10', token);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.hasNextPage).toBe(false);
      expect(response.body.pagination.hasPrevPage).toBe(true);
    });

    it('should filter tasks by status', async () => {
      await createTestTask(testUser._id, { title: 'Completed Task', status: 'completed' });

      const response = await authenticatedRequest('get', '/api/v1/tasks?status=completed', token);

      expect(response.status).toBe(200);
      expect(response.body.data.every(task => task.status === 'completed')).toBe(true);
    });

    it('should filter tasks by priority', async () => {
      await createTestTask(testUser._id, { title: 'High Priority', priority: 'high' });

      const response = await authenticatedRequest('get', '/api/v1/tasks?priority=high', token);

      expect(response.status).toBe(200);
      expect(response.body.data.every(task => task.priority === 'high')).toBe(true);
    });

    it('should filter tasks by category', async () => {
      await createTestTask(testUser._id, { title: 'Work Task', category: 'work' });

      const response = await authenticatedRequest('get', '/api/v1/tasks?category=work', token);

      expect(response.status).toBe(200);
      expect(response.body.data.every(task => task.category === 'work')).toBe(true);
    });

    it('should filter tasks by tags', async () => {
      await createTestTask(testUser._id, { title: 'Tagged Task', tags: ['urgent'] });

      const response = await authenticatedRequest('get', '/api/v1/tasks?tags=urgent', token);

      expect(response.status).toBe(200);
      expect(response.body.data.some(task => task.tags.includes('urgent'))).toBe(true);
    });

    it('should sort tasks by due date', async () => {
      const response = await authenticatedRequest('get', '/api/v1/tasks?sortBy=dueDate', token);

      expect(response.status).toBe(200);
      // Check if sorted (ascending)
      for (let i = 1; i < response.body.data.length; i++) {
        if (response.body.data[i].dueDate && response.body.data[i - 1].dueDate) {
          expect(new Date(response.body.data[i].dueDate) >= new Date(response.body.data[i - 1].dueDate)).toBe(true);
        }
      }
    });

    it('should not return tasks from other users', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
        name: 'Other User',
        password: 'SecureP@ss123!'
      });
      
      await createTestTask(otherUser.user._id, { title: 'Other User Task' });

      const response = await authenticatedRequest('get', '/api/v1/tasks', token);

      expect(response.status).toBe(200);
      expect(response.body.data.every(task => task.createdBy === testUser._id.toString())).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/v1/tasks');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await createTestTask(testUser._id, validTask);
    });

    it('should get a single task', async () => {
      const response = await authenticatedRequest('get', `/api/v1/tasks/${task._id}`, token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(task._id.toString());
      expect(response.body.data.title).toBe(task.title);
    });

    it('should populate user references', async () => {
      const response = await authenticatedRequest('get', `/api/v1/tasks/${task._id}`, token);

      expect(response.status).toBe(200);
      expect(response.body.data.createdBy).toBeDefined();
      expect(response.body.data.createdBy.name).toBeDefined();
      expect(response.body.data.createdBy.email).toBeDefined();
    });

    it('should fail with invalid task ID', async () => {
      const response = await authenticatedRequest('get', '/api/v1/tasks/invalid_id', token);

      expect(response.status).toBe(500); // CastError
    });

    it('should fail with non-existent task ID', async () => {
      const response = await authenticatedRequest('get', '/api/v1/tasks/507f1f77bcf86cd799439011', token);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should not allow access to other user\'s task', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
        name: 'Other User',
        password: 'SecureP@ss123!'
      });
      
      const otherTask = await createTestTask(otherUser.user._id, { title: 'Other User Task' });

      const response = await authenticatedRequest('get', `/api/v1/tasks/${otherTask._id}`, token);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await createTestTask(testUser._id, validTask);
    });

    it('should update a task', async () => {
      const updates = {
        title: 'Updated Title',
        status: 'in-progress',
        priority: 'high'
      };

      const response = await authenticatedRequest('put', `/api/v1/tasks/${task._id}`, token)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.status).toBe(updates.status);
      expect(response.body.data.priority).toBe(updates.priority);
    });

    it('should allow partial updates', async () => {
      const response = await authenticatedRequest('put', `/api/v1/tasks/${task._id}`, token)
        .send({ title: 'Only Title Updated' });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Only Title Updated');
      expect(response.body.data.status).toBe(task.status);
    });

    it('should fail with invalid status', async () => {
      const response = await authenticatedRequest('put', `/api/v1/tasks/${task._id}`, token)
        .send({ status: 'invalid' });

      expect(response.status).toBe(400);
    });

    it('should fail with non-existent task', async () => {
      const response = await authenticatedRequest('put', '/api/v1/tasks/507f1f77bcf86cd799439011', token)
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
    });

    it('should not allow updating other user\'s task', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
        name: 'Other User',
        password: 'SecureP@ss123!'
      });
      
      const otherTask = await createTestTask(otherUser.user._id, { title: 'Other User Task' });

      const response = await authenticatedRequest('put', `/api/v1/tasks/${otherTask._id}`, token)
        .send({ title: 'Hacked' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await createTestTask(testUser._id, validTask);
    });

    it('should delete a task', async () => {
      const response = await authenticatedRequest('delete', `/api/v1/tasks/${task._id}`, token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('deleted');

      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    it('should fail with non-existent task', async () => {
      const response = await authenticatedRequest('delete', '/api/v1/tasks/507f1f77bcf86cd799439011', token);

      expect(response.status).toBe(404);
    });

    it('should not allow deleting other user\'s task', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
        name: 'Other User',
        password: 'SecureP@ss123!'
      });
      
      const otherTask = await createTestTask(otherUser.user._id, { title: 'Other User Task' });

      const response = await authenticatedRequest('delete', `/api/v1/tasks/${otherTask._id}`, token);

      expect(response.status).toBe(404);

      const stillExists = await Task.findById(otherTask._id);
      expect(stillExists).toBeDefined();
    });
  });

  describe('GET /api/v1/tasks/stats', () => {
    beforeEach(async () => {
      await createTestTask(testUser._id, { title: 'Todo 1', status: 'todo' });
      await createTestTask(testUser._id, { title: 'Todo 2', status: 'todo' });
      await createTestTask(testUser._id, { title: 'In Progress', status: 'in-progress' });
      await createTestTask(testUser._id, { title: 'Completed', status: 'completed' });
    });

    it('should get task statistics', async () => {
      const response = await authenticatedRequest('get', '/api/v1/tasks/stats', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(4);
      expect(response.body.data.todo).toBe(2);
      expect(response.body.data['in-progress']).toBe(1);
      expect(response.body.data.completed).toBe(1);
    });
  });

  describe('GET /api/v1/tasks/overdue', () => {
    beforeEach(async () => {
      await createTestTask(testUser._id, {
        title: 'Overdue Task',
        status: 'todo',
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
      });
      
      await createTestTask(testUser._id, {
        title: 'Future Task',
        status: 'todo',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    });

    it('should get overdue tasks', async () => {
      const response = await authenticatedRequest('get', '/api/v1/tasks/overdue', token);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].title).toBe('Overdue Task');
    });
  });

  describe('GET /api/v1/tasks/search', () => {
    beforeEach(async () => {
      await createTestTask(testUser._id, { title: 'Documentation Task', description: 'Write docs' });
      await createTestTask(testUser._id, { title: 'Testing Task', description: 'Write tests' });
    });

    it('should search tasks by title', async () => {
      const response = await authenticatedRequest('get', '/api/v1/tasks/search?q=Documentation', token);

      expect(response.status).toBe(200);
      expect(response.body.data.some(task => task.title.includes('Documentation'))).toBe(true);
    });

    it('should fail without search query', async () => {
      const response = await authenticatedRequest('get', '/api/v1/tasks/search', token);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });
  });

  describe('PATCH /api/v1/tasks/bulk', () => {
    let tasks;

    beforeEach(async () => {
      tasks = await createTestTasks(testUser._id, 3);
    });

    it('should bulk update tasks', async () => {
      const taskIds = tasks.map(t => t._id.toString());
      
      const response = await authenticatedRequest('patch', '/api/v1/tasks/bulk', token)
        .send({
          taskIds,
          updates: { status: 'completed', priority: 'low' }
        });

      expect(response.status).toBe(200);
      expect(response.body.data.modifiedCount).toBe(3);

      const updated = await Task.find({ _id: { $in: taskIds } });
      expect(updated.every(t => t.status === 'completed')).toBe(true);
    });

    it('should fail without taskIds', async () => {
      const response = await authenticatedRequest('patch', '/api/v1/tasks/bulk', token)
        .send({ updates: { status: 'completed' } });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/tasks/bulk', () => {
    let tasks;

    beforeEach(async () => {
      tasks = await createTestTasks(testUser._id, 3);
    });

    it('should bulk delete tasks', async () => {
      const taskIds = tasks.map(t => t._id.toString());
      
      const response = await authenticatedRequest('delete', '/api/v1/tasks/bulk', token)
        .send({ taskIds });

      expect(response.status).toBe(200);
      expect(response.body.data.deletedCount).toBe(3);

      const remaining = await Task.find({ _id: { $in: taskIds } });
      expect(remaining).toHaveLength(0);
    });

    it('should fail without taskIds', async () => {
      const response = await authenticatedRequest('delete', '/api/v1/tasks/bulk', token)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent task creation', async () => {
      const promises = Array(5).fill(null).map((_, i) =>
        authenticatedRequest('post', '/api/v1/tasks', token)
          .send({ title: `Concurrent Task ${i}` })
      );

      const results = await Promise.all(promises);

      expect(results.every(r => r.status === 201)).toBe(true);
      
      const tasks = await Task.find({ createdBy: testUser._id });
      expect(tasks).toHaveLength(5);
    });

    it('should handle very long task title', async () => {
      const longTitle = 'A'.repeat(200);
      
      const response = await authenticatedRequest('post', '/api/v1/tasks', token)
        .send({ title: longTitle });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe(longTitle);
    });

    it('should reject task title exceeding max length', async () => {
      const tooLongTitle = 'A'.repeat(201);
      
      const response = await authenticatedRequest('post', '/api/v1/tasks', token)
        .send({ title: tooLongTitle });

      expect(response.status).toBe(400);
    });

    it('should handle empty pagination results', async () => {
      const response = await authenticatedRequest('get', '/api/v1/tasks?page=999', token);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });
});
