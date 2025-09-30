# Task Management API

A RESTful API for task management built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT-based authentication
- ✅ Complete CRUD operations for tasks
- 🛡️ Input validation with Joi
- 🚨 Comprehensive error handling
- 📊 Task statistics
- 🏗️ MVC architecture
- 🔒 Security best practices (Helmet, CORS)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, bcryptjs
- **Logging**: Morgan

## Project Structure

```
task-management-api/
├── config/              # Configuration files
├── controllers/         # Request handlers
├── middleware/          # Custom middleware
├── models/             # Database models
├── routes/             # API routes
├── services/           # Business logic
├── utils/              # Utility functions
├── app.js              # Express app setup
└── server.js           # Server entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory and update the values:
```
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
```

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user (Protected)

### Tasks

- `GET /api/v1/tasks` - Get all tasks (Protected)
- `POST /api/v1/tasks` - Create a new task (Protected)
- `GET /api/v1/tasks/:id` - Get a single task (Protected)
- `PUT /api/v1/tasks/:id` - Update a task (Protected)
- `DELETE /api/v1/tasks/:id` - Delete a task (Protected)
- `GET /api/v1/tasks/stats` - Get task statistics (Protected)

### Query Parameters

**GET /api/v1/tasks**
- `status` - Filter by status (todo, in-progress, completed)
- `priority` - Filter by priority (low, medium, high)
- `sortBy` - Sort field (default: -createdAt)

## Request Examples

### Register User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Task
```bash
POST /api/v1/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "todo",
  "priority": "high",
  "dueDate": "2024-12-31"
}
```

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [] // Optional validation errors
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- HTTP security headers with Helmet
- CORS enabled
- Input validation and sanitization
- MongoDB injection prevention

## License

ISC
