const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./docs/openapi.json');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
const config = require('./config/config');
if (config.server.isDevelopment) {
  app.use(morgan(config.logging.format));
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// OpenAPI/Swagger docs
app.get('/openapi.json', (req, res) => {
  res.status(200).json(openapiSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
  explorer: true,
  customSiteTitle: 'Task Management API Docs'
}));

// API routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/tasks', require('./routes/taskRoutes'));

// 404 handler
app.use(errorHandler.notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
