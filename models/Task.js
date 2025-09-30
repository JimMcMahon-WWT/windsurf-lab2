const mongoose = require('mongoose');

/**
 * Task Schema
 * Represents a task/todo item in the system
 */
const taskSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [1, 'Title cannot be empty'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },

  // Status and Priority
  status: {
    type: String,
    enum: {
      values: ['todo', 'in-progress', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'todo',
    index: true
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: '{VALUE} is not a valid priority'
    },
    default: 'medium',
    index: true
  },

  // Dates
  dueDate: {
    type: Date,
    default: null,
    validate: {
      validator: function(value) {
        // Due date should be in the future for new tasks
        if (this.isNew && value) {
          return value >= new Date();
        }
        return true;
      },
      message: 'Due date must be in the future'
    }
  },
  startDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },

  // Relationships
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must have a creator'],
    index: true,
    alias: 'user' // Alias for backward compatibility
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters'],
    default: 'general'
  },

  // Additional Fields
  estimatedTime: {
    type: Number, // in minutes
    min: [0, 'Estimated time cannot be negative'],
    default: null
  },
  actualTime: {
    type: Number, // in minutes
    min: [0, 'Actual time cannot be negative'],
    default: null
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Subtasks
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],

  // Metadata
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    default: ''
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==========================================
// INDEXES
// ==========================================
// Compound indexes for efficient queries
taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ createdBy: 1, priority: 1 });
taskSchema.index({ createdBy: 1, dueDate: 1 });
taskSchema.index({ createdBy: 1, createdAt: -1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ status: 1, priority: -1, dueDate: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ isArchived: 1, createdBy: 1 });

// Text index for search functionality
taskSchema.index({ title: 'text', description: 'text', tags: 'text' });

// ==========================================
// VIRTUALS
// ==========================================
// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual for checking if task is due soon (within 24 hours)
taskSchema.virtual('isDueSoon').get(function() {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  const tomorrow = new Date();
  tomorrow.setHours(tomorrow.getHours() + 24);
  return this.dueDate <= tomorrow && this.dueDate > new Date();
});

// Virtual for completion percentage of subtasks
taskSchema.virtual('subtaskProgress').get(function() {
  if (!this.subtasks || this.subtasks.length === 0) {
    return 0;
  }
  const completed = this.subtasks.filter(st => st.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

// Virtual for time tracking
taskSchema.virtual('timeVariance').get(function() {
  if (!this.estimatedTime || !this.actualTime) {
    return null;
  }
  return this.actualTime - this.estimatedTime;
});

// ==========================================
// MIDDLEWARE (HOOKS)
// ==========================================
// Update completedAt when status changes to completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = null;
    }
  }
  next();
});

// Auto-assign task to creator if not assigned
taskSchema.pre('save', function(next) {
  if (this.isNew && !this.assignedTo) {
    this.assignedTo = this.createdBy;
  }
  next();
});

// Update subtask completedAt
taskSchema.pre('save', function(next) {
  if (this.isModified('subtasks')) {
    this.subtasks.forEach(subtask => {
      if (subtask.completed && !subtask.completedAt) {
        subtask.completedAt = new Date();
      } else if (!subtask.completed) {
        subtask.completedAt = undefined;
      }
    });
  }
  next();
});

// ==========================================
// INSTANCE METHODS
// ==========================================
/**
 * Mark task as completed
 * @returns {Promise<Task>}
 */
taskSchema.methods.complete = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

/**
 * Mark task as cancelled
 * @returns {Promise<Task>}
 */
taskSchema.methods.cancel = async function() {
  this.status = 'cancelled';
  return this.save();
};

/**
 * Archive task
 * @returns {Promise<Task>}
 */
taskSchema.methods.archive = async function() {
  this.isArchived = true;
  return this.save();
};

/**
 * Add a subtask
 * @param {string} title - Subtask title
 * @returns {Promise<Task>}
 */
taskSchema.methods.addSubtask = async function(title) {
  this.subtasks.push({ title, completed: false });
  return this.save();
};

/**
 * Toggle subtask completion
 * @param {string} subtaskId - Subtask ID
 * @returns {Promise<Task>}
 */
taskSchema.methods.toggleSubtask = async function(subtaskId) {
  const subtask = this.subtasks.id(subtaskId);
  if (subtask) {
    subtask.completed = !subtask.completed;
    subtask.completedAt = subtask.completed ? new Date() : null;
    return this.save();
  }
  throw new Error('Subtask not found');
};

/**
 * Add a tag
 * @param {string} tag - Tag to add
 * @returns {Promise<Task>}
 */
taskSchema.methods.addTag = async function(tag) {
  if (!this.tags.includes(tag.toLowerCase())) {
    this.tags.push(tag.toLowerCase());
    return this.save();
  }
  return this;
};

/**
 * Remove a tag
 * @param {string} tag - Tag to remove
 * @returns {Promise<Task>}
 */
taskSchema.methods.removeTag = async function(tag) {
  this.tags = this.tags.filter(t => t !== tag.toLowerCase());
  return this.save();
};

// ==========================================
// STATIC METHODS
// ==========================================
/**
 * Get tasks by status for a user
 * @param {ObjectId} userId - User ID
 * @param {string} status - Task status
 * @returns {Promise<Task[]>}
 */
taskSchema.statics.findByUserAndStatus = function(userId, status) {
  return this.find({ createdBy: userId, status, isArchived: false })
    .sort({ priority: -1, dueDate: 1 });
};

/**
 * Get overdue tasks for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Task[]>}
 */
taskSchema.statics.findOverdue = function(userId) {
  return this.find({
    createdBy: userId,
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] },
    isArchived: false
  }).sort({ dueDate: 1 });
};

/**
 * Get tasks due soon for a user
 * @param {ObjectId} userId - User ID
 * @param {number} hours - Hours threshold (default 24)
 * @returns {Promise<Task[]>}
 */
taskSchema.statics.findDueSoon = function(userId, hours = 24) {
  const threshold = new Date();
  threshold.setHours(threshold.getHours() + hours);
  
  return this.find({
    createdBy: userId,
    dueDate: { $gte: new Date(), $lte: threshold },
    status: { $nin: ['completed', 'cancelled'] },
    isArchived: false
  }).sort({ dueDate: 1 });
};

/**
 * Search tasks by text
 * @param {ObjectId} userId - User ID
 * @param {string} searchText - Search query
 * @returns {Promise<Task[]>}
 */
taskSchema.statics.searchTasks = function(userId, searchText) {
  return this.find({
    createdBy: userId,
    $text: { $search: searchText },
    isArchived: false
  }).sort({ score: { $meta: 'textScore' } });
};

/**
 * Get task statistics for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>}
 */
taskSchema.statics.getStatistics = async function(userId) {
  const stats = await this.aggregate([
    { $match: { createdBy: userId, isArchived: false } },
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
    completed: 0,
    cancelled: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  // Get overdue count
  result.overdue = await this.countDocuments({
    createdBy: userId,
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] },
    isArchived: false
  });

  return result;
};

module.exports = mongoose.model('Task', taskSchema);
