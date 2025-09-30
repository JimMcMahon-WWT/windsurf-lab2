const Task = require('../models/Task');
const ApiError = require('../utils/apiError');

class TaskService {
  // Create a new task
  async createTask(userId, taskData) {
    const task = await Task.create({
      ...taskData,
      user: userId
    });

    return task;
  }

  // Get all tasks for a user
  async getTasks(userId, filters = {}) {
    const { status, priority, sortBy = '-createdAt' } = filters;

    const query = { user: userId };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const tasks = await Task.find(query).sort(sortBy);

    return tasks;
  }

  // Get a single task by ID
  async getTaskById(userId, taskId) {
    const task = await Task.findOne({ _id: taskId, user: userId });

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    return task;
  }

  // Update a task
  async updateTask(userId, taskId, updateData) {
    const task = await Task.findOne({ _id: taskId, user: userId });

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    Object.assign(task, updateData);
    await task.save();

    return task;
  }

  // Delete a task
  async deleteTask(userId, taskId) {
    const task = await Task.findOne({ _id: taskId, user: userId });

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    await task.deleteOne();

    return { message: 'Task deleted successfully' };
  }

  // Get task statistics
  async getTaskStats(userId) {
    const stats = await Task.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      todo: 0,
      'in-progress': 0,
      completed: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  }
}

module.exports = new TaskService();
