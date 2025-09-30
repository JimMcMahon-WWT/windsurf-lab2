const Task = require('../../../models/Task');
const User = require('../../../models/User');
const { validTask, invalidTasks } = require('../../helpers/testData');
const { createTestUser } = require('../../helpers/testHelpers');

describe('Task Model', () => {
  let testUser;

  beforeEach(async () => {
    const result = await createTestUser();
    testUser = result.user;
  });

  describe('Validation', () => {
    it('should create a valid task', async () => {
      const task = await Task.create({
        ...validTask,
        createdBy: testUser._id
      });
      
      expect(task._id).toBeDefined();
      expect(task.title).toBe(validTask.title);
      expect(task.status).toBe(validTask.status);
      expect(task.priority).toBe(validTask.priority);
      expect(task.createdBy.toString()).toBe(testUser._id.toString());
    });

    it('should fail without title', async () => {
      const task = new Task({
        ...invalidTasks.noTitle,
        createdBy: testUser._id
      });
      
      await expect(task.save()).rejects.toThrow();
    });

    it('should fail with invalid status', async () => {
      const task = new Task({
        ...invalidTasks.invalidStatus,
        createdBy: testUser._id
      });
      
      await expect(task.save()).rejects.toThrow();
    });

    it('should fail with invalid priority', async () => {
      const task = new Task({
        ...invalidTasks.invalidPriority,
        createdBy: testUser._id
      });
      
      await expect(task.save()).rejects.toThrow();
    });

    it('should fail without createdBy', async () => {
      const task = new Task(validTask);
      
      await expect(task.save()).rejects.toThrow();
    });

    it('should set default values', async () => {
      const task = await Task.create({
        title: 'Minimal Task',
        createdBy: testUser._id
      });
      
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('medium');
      expect(task.description).toBe('');
      expect(task.isArchived).toBe(false);
    });
  });

  describe('Middleware Hooks', () => {
    it('should auto-assign task to creator', async () => {
      const task = await Task.create({
        ...validTask,
        createdBy: testUser._id
      });
      
      expect(task.assignedTo.toString()).toBe(testUser._id.toString());
    });

    it('should set completedAt when status changes to completed', async () => {
      const task = await Task.create({
        ...validTask,
        createdBy: testUser._id
      });
      
      expect(task.completedAt).toBeNull();
      
      task.status = 'completed';
      await task.save();
      
      expect(task.completedAt).toBeDefined();
      expect(task.completedAt).toBeInstanceOf(Date);
    });

    it('should clear completedAt when status changes from completed', async () => {
      const task = await Task.create({
        ...validTask,
        status: 'completed',
        createdBy: testUser._id
      });
      
      expect(task.completedAt).toBeDefined();
      
      task.status = 'in-progress';
      await task.save();
      
      expect(task.completedAt).toBeNull();
    });

    it('should update subtask completedAt', async () => {
      const task = await Task.create({
        ...validTask,
        createdBy: testUser._id,
        subtasks: [
          { title: 'Subtask 1', completed: false },
          { title: 'Subtask 2', completed: true }
        ]
      });
      
      expect(task.subtasks[0].completedAt).toBeUndefined();
      expect(task.subtasks[1].completedAt).toBeDefined();
    });
  });

  describe('Instance Methods', () => {
    it('should mark task as completed', async () => {
      const task = await Task.create({
        ...validTask,
        createdBy: testUser._id
      });
      
      await task.complete();
      
      expect(task.status).toBe('completed');
      expect(task.completedAt).toBeDefined();
    });

    it('should mark task as cancelled', async () => {
      const task = await Task.create({
        ...validTask,
        createdBy: testUser._id
      });
      
      await task.cancel();
      
      expect(task.status).toBe('cancelled');
    });

    it('should archive task', async () => {
      const task = await Task.create({
        ...validTask,
        createdBy: testUser._id
      });
      
      await task.archive();
      
      expect(task.isArchived).toBe(true);
    });

    it('should add subtask', async () => {
      const task = await Task.create({
        ...validTask,
        createdBy: testUser._id
      });
      
      await task.addSubtask('New Subtask');
      
      expect(task.subtasks).toHaveLength(1);
      expect(task.subtasks[0].title).toBe('New Subtask');
      expect(task.subtasks[0].completed).toBe(false);
    });

    it('should toggle subtask completion', async () => {
      const task = await Task.create({
        ...validTask,
        createdBy: testUser._id,
        subtasks: [{ title: 'Test Subtask', completed: false }]
      });
      
      const subtaskId = task.subtasks[0]._id;
      await task.toggleSubtask(subtaskId);
      
      expect(task.subtasks[0].completed).toBe(true);
      expect(task.subtasks[0].completedAt).toBeDefined();
    });

    it('should add tag', async () => {
      const task = await Task.create({
        ...validTask,
        createdBy: testUser._id
      });
      
      await task.addTag('urgent');
      
      expect(task.tags).toContain('urgent');
    });

    it('should not add duplicate tag', async () => {
      const task = await Task.create({
        ...validTask,
        createdBy: testUser._id,
        tags: ['urgent']
      });
      
      await task.addTag('urgent');
      
      expect(task.tags.filter(t => t === 'urgent')).toHaveLength(1);
    });

    it('should remove tag', async () => {
      const task = await Task.create({
        ...validTask,
        createdBy: testUser._id,
        tags: ['urgent', 'important']
      });
      
      await task.removeTag('urgent');
      
      expect(task.tags).not.toContain('urgent');
      expect(task.tags).toContain('important');
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create test tasks
      await Task.create({
        title: 'Todo Task',
        status: 'todo',
        priority: 'high',
        createdBy: testUser._id
      });
      
      await Task.create({
        title: 'In Progress Task',
        status: 'in-progress',
        priority: 'medium',
        createdBy: testUser._id
      });
      
      await Task.create({
        title: 'Completed Task',
        status: 'completed',
        priority: 'low',
        createdBy: testUser._id
      });
    });

    it('should find tasks by status', async () => {
      const tasks = await Task.findByUserAndStatus(testUser._id, 'todo');
      
      expect(tasks).toHaveLength(1);
      expect(tasks[0].status).toBe('todo');
    });

    it('should find overdue tasks', async () => {
      await Task.create({
        title: 'Overdue Task',
        status: 'todo',
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        createdBy: testUser._id
      });
      
      const tasks = await Task.findOverdue(testUser._id);
      
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0].title).toBe('Overdue Task');
    });

    it('should find tasks due soon', async () => {
      await Task.create({
        title: 'Due Soon Task',
        status: 'todo',
        dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        createdBy: testUser._id
      });
      
      const tasks = await Task.findDueSoon(testUser._id, 24);
      
      expect(tasks.length).toBeGreaterThan(0);
    });

    it('should get task statistics', async () => {
      const stats = await Task.getStatistics(testUser._id);
      
      expect(stats.total).toBe(3);
      expect(stats.todo).toBe(1);
      expect(stats['in-progress']).toBe(1);
      expect(stats.completed).toBe(1);
    });
  });

  describe('Virtuals', () => {
    it('should check if task is overdue', async () => {
      const overdueTask = await Task.create({
        ...validTask,
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        createdBy: testUser._id
      });
      
      expect(overdueTask.isOverdue).toBe(true);
      
      const futureTask = await Task.create({
        ...validTask,
        title: 'Future Task',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdBy: testUser._id
      });
      
      expect(futureTask.isOverdue).toBe(false);
    });

    it('should check if task is due soon', async () => {
      const dueSoonTask = await Task.create({
        ...validTask,
        dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
        createdBy: testUser._id
      });
      
      expect(dueSoonTask.isDueSoon).toBe(true);
    });

    it('should calculate subtask progress', async () => {
      const task = await Task.create({
        ...validTask,
        createdBy: testUser._id,
        subtasks: [
          { title: 'Subtask 1', completed: true },
          { title: 'Subtask 2', completed: true },
          { title: 'Subtask 3', completed: false },
          { title: 'Subtask 4', completed: false }
        ]
      });
      
      expect(task.subtaskProgress).toBe(50);
    });

    it('should calculate time variance', async () => {
      const task = await Task.create({
        ...validTask,
        estimatedTime: 120,
        actualTime: 150,
        createdBy: testUser._id
      });
      
      expect(task.timeVariance).toBe(30);
    });
  });
});
