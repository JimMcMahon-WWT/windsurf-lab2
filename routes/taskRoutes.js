const express = require('express');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { validate, createTaskSchema, updateTaskSchema } = require('../utils/validators');

const router = express.Router();

// All routes are protected
router.use(protect);

// Stats route must come before /:id to avoid conflict
router.get('/stats', taskController.getTaskStats);

router
  .route('/')
  .get(taskController.getTasks)
  .post(validate(createTaskSchema), taskController.createTask);

router
  .route('/:id')
  .get(taskController.getTask)
  .put(validate(updateTaskSchema), taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
