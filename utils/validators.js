const Joi = require('joi');
const { validatePasswordStrength } = require('./passwordValidator');

// Custom Joi validator for strong passwords
const strongPassword = (value, helpers) => {
  const validation = validatePasswordStrength(value);
  
  if (!validation.isValid) {
    return helpers.error('password.weak', { errors: validation.errors });
  }
  
  return value;
};

// User validation schemas
const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Username can only contain letters, numbers, underscores, and hyphens',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters'
    }),
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .custom(strongPassword)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'password.weak': '{{#errors}}'
    })
});

const loginSchema = Joi.object({
  identifier: Joi.string().required().messages({
    'any.required': 'Email or username is required'
  }),
  password: Joi.string().required()
}).or('email', 'identifier'); // Support both email and identifier

// Alternative login schema for backward compatibility
const loginSchemaLegacy = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Task validation schemas
const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  status: Joi.string().valid('todo', 'in-progress', 'completed', 'cancelled').default('todo'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  dueDate: Joi.date().iso().min('now').allow(null).messages({
    'date.min': 'Due date must be in the future'
  }),
  startDate: Joi.date().iso().allow(null),
  assignedTo: Joi.string().hex().length(24).allow(null), // MongoDB ObjectId
  tags: Joi.array().items(Joi.string().max(30)).max(10),
  category: Joi.string().max(50),
  estimatedTime: Joi.number().min(0).allow(null),
  notes: Joi.string().max(2000).allow('')
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().max(1000).allow(''),
  status: Joi.string().valid('todo', 'in-progress', 'completed', 'cancelled'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  dueDate: Joi.date().iso().allow(null),
  startDate: Joi.date().iso().allow(null),
  assignedTo: Joi.string().hex().length(24).allow(null),
  tags: Joi.array().items(Joi.string().max(30)).max(10),
  category: Joi.string().max(50),
  estimatedTime: Joi.number().min(0).allow(null),
  actualTime: Joi.number().min(0).allow(null),
  notes: Joi.string().max(2000).allow(''),
  isArchived: Joi.boolean()
}).min(1);

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createTaskSchema,
  updateTaskSchema
};
