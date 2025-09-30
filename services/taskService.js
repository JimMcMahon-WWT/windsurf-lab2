const Task = require('../models/Task');
const ApiError = require('../utils/apiError');

class TaskService {
  // Create a new task
  async createTask(userId, taskData) {
    const task = await Task.create({
      ...taskData,
      createdBy: userId
    });

    return task;
  }

  // Get all tasks for a user
  async getTasks(userId, filters = {}) {
    const { status, priority, sortBy = '-createdAt', category, tags } = filters;

    const query = { createdBy: userId, isArchived: false };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (category) {
      query.category = category;
    }

    if (tags) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email username avatar')
      .sort(sortBy);

    return tasks;
  }

  // Get a single task by ID
  async getTaskById(userId, taskId) {
    const task = await Task.findOne({ _id: taskId, createdBy: userId })
      .populate('createdBy', 'name email username avatar')
      .populate('assignedTo', 'name email username avatar');

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    return task;
  }

  // Update a task
  async updateTask(userId, taskId, updateData) {
    const task = await Task.findOne({ _id: taskId, createdBy: userId });

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    Object.assign(task, updateData);
    await task.save();

    return task;
  }

  // Delete a task
  async deleteTask(userId, taskId) {
    const task = await Task.findOne({ _id: taskId, createdBy: userId });

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    await task.deleteOne();

    return { message: 'Task deleted successfully' };
  }

  // Get task statistics
  async getTaskStats(userId) {
    // Use the static method from Task model
    return await Task.getStatistics(userId);
  }
}

module.exports = new TaskService();
