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

  // Get all tasks for a user with pagination and filtering
  async getTasks(userId, filters = {}) {
    const {
      status,
      priority,
      category,
      tags,
      search,
      isArchived,
      dueDateFrom,
      dueDateTo,
      sortBy = '-createdAt',
      page = 1,
      limit = 10
    } = filters;

    // Build query
    const query = { createdBy: userId };

    // Archive filter (default: show non-archived)
    if (isArchived !== undefined) {
      query.isArchived = isArchived === 'true' || isArchived === true;
    } else {
      query.isArchived = false;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Priority filter
    if (priority) {
      query.priority = priority;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Tags filter
    if (tags) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    // Date range filter
    if (dueDateFrom || dueDateTo) {
      query.dueDate = {};
      if (dueDateFrom) {
        query.dueDate.$gte = new Date(dueDateFrom);
      }
      if (dueDateTo) {
        query.dueDate.$lte = new Date(dueDateTo);
      }
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', 'name email username avatar')
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Task.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return {
      tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    };
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

  // Get overdue tasks
  async getOverdueTasks(userId) {
    const tasks = await Task.findOverdue(userId);
    return tasks;
  }

  // Get tasks due soon
  async getDueSoonTasks(userId, hours = 24) {
    const tasks = await Task.findDueSoon(userId, hours);
    return tasks;
  }

  // Search tasks
  async searchTasks(userId, searchText) {
    if (!searchText || searchText.trim() === '') {
      throw ApiError.badRequest('Search text is required');
    }

    const tasks = await Task.searchTasks(userId, searchText);
    return tasks;
  }

  // Bulk update tasks
  async bulkUpdateTasks(userId, taskIds, updateData) {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw ApiError.badRequest('Task IDs array is required');
    }

    const result = await Task.updateMany(
      { _id: { $in: taskIds }, createdBy: userId },
      { $set: updateData }
    );

    return {
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} task(s) updated successfully`
    };
  }

  // Bulk delete tasks
  async bulkDeleteTasks(userId, taskIds) {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw ApiError.badRequest('Task IDs array is required');
    }

    const result = await Task.deleteMany({
      _id: { $in: taskIds },
      createdBy: userId
    });

    return {
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} task(s) deleted successfully`
    };
  }
}

module.exports = new TaskService();
