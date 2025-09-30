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

  // @desc    Get all tasks for logged in user
  // @route   GET /api/v1/tasks
  // @access  Private
  async getTasks(req, res, next) {
    try {
      const { status, priority, sortBy, category, tags } = req.query;
      const tasks = await taskService.getTasks(req.user._id, { status, priority, sortBy, category, tags });

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
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
}

module.exports = new TaskController();
