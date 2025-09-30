const express = require('express');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { validate, createTaskSchema, updateTaskSchema } = require('../utils/validators');
const { createTaskLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All routes are protected
router.use(protect);

// Special routes (must come before /:id to avoid conflicts)
router.get('/stats', taskController.getTaskStats);
router.get('/overdue', taskController.getOverdueTasks);
router.get('/due-soon', taskController.getDueSoonTasks);
router.get('/search', taskController.searchTasks);

// Bulk operations
router.patch('/bulk', taskController.bulkUpdateTasks);
router.delete('/bulk', taskController.bulkDeleteTasks);

// Standard CRUD routes
router
  .route('/')
  .get(taskController.getTasks)
  .post(createTaskLimiter, validate(createTaskSchema), taskController.createTask);

router
  .route('/:id')
  .get(taskController.getTask)
  .put(validate(updateTaskSchema), taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
