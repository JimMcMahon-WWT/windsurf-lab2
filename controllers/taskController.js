const taskService = require('../services/taskService');

class TaskController {
  // @desc    Create a new task
  // @route   POST /api/v1/tasks
  // @access  Private
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.user._id, req.body);

      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get all tasks for logged in user with pagination
  // @route   GET /api/v1/tasks
  // @access  Private
  async getTasks(req, res, next) {
    try {
      const result = await taskService.getTasks(req.user._id, req.query);

      res.status(200).json({
        success: true,
        count: result.tasks.length,
        pagination: result.pagination,
        data: result.tasks
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get single task
  // @route   GET /api/v1/tasks/:id
  // @access  Private
  async getTask(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.user._id, req.params.id);

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update task
  // @route   PUT /api/v1/tasks/:id
  // @access  Private
  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(req.user._id, req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete task
  // @route   DELETE /api/v1/tasks/:id
  // @access  Private
  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.user._id, req.params.id);

      res.status(200).json({
        success: true,
        data: { message: 'Task deleted successfully' }
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get task statistics
  // @route   GET /api/v1/tasks/stats
  // @access  Private
  async getTaskStats(req, res, next) {
    try {
      const stats = await taskService.getTaskStats(req.user._id);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get overdue tasks
  // @route   GET /api/v1/tasks/overdue
  // @access  Private
  async getOverdueTasks(req, res, next) {
    try {
      const tasks = await taskService.getOverdueTasks(req.user._id);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get tasks due soon
  // @route   GET /api/v1/tasks/due-soon
  // @access  Private
  async getDueSoonTasks(req, res, next) {
    try {
      const hours = parseInt(req.query.hours) || 24;
      const tasks = await taskService.getDueSoonTasks(req.user._id, hours);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Search tasks
  // @route   GET /api/v1/tasks/search
  // @access  Private
  async searchTasks(req, res, next) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query parameter "q" is required'
        });
      }

      const tasks = await taskService.searchTasks(req.user._id, q);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Bulk update tasks
  // @route   PATCH /api/v1/tasks/bulk
  // @access  Private
  async bulkUpdateTasks(req, res, next) {
    try {
      const { taskIds, updates } = req.body;

      if (!taskIds || !updates) {
        return res.status(400).json({
          success: false,
          message: 'taskIds and updates are required'
        });
      }

      const result = await taskService.bulkUpdateTasks(req.user._id, taskIds, updates);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Bulk delete tasks
  // @route   DELETE /api/v1/tasks/bulk
  // @access  Private
  async bulkDeleteTasks(req, res, next) {
    try {
      const { taskIds } = req.body;

      if (!taskIds) {
        return res.status(400).json({
          success: false,
          message: 'taskIds array is required'
        });
      }

      const result = await taskService.bulkDeleteTasks(req.user._id, taskIds);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
