# API Endpoints Documentation

Complete reference for all API endpoints in the Task Management API.

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [HTTP Status Codes](#http-status-codes)
- [Authentication Endpoints](#authentication-endpoints)
- [Task Endpoints](#task-endpoints)
- [Error Responses](#error-responses)

---

## Base URL

```
http://localhost:3000/api/v1
```

Production: `https://your-domain.com/api/v1`

---

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## Response Format

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10,           // For list endpoints
  "pagination": { ... }  // For paginated endpoints
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid input, validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email exists) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

**Rate Limit:** 3 requests per hour

**Request Body:**
```json
{
  "username": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecureP@ss123!"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login

**POST** `/auth/login`

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
```json
{
  "identifier": "johndoe",
  "password": "SecureP@ss123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "...",
    "refreshToken": "..."
  }
}
```

---

### Get Current User

**GET** `/auth/me`

**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "preferences": { ... }
  }
}
```

---

### Refresh Token

**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Task Endpoints

### List Tasks (with Pagination)

**GET** `/tasks`

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `status` | string | - | Filter by status: todo, in-progress, completed, cancelled |
| `priority` | string | - | Filter by priority: low, medium, high, urgent |
| `category` | string | - | Filter by category |
| `tags` | string | - | Filter by tags (comma-separated) |
| `search` | string | - | Full-text search |
| `isArchived` | boolean | false | Show archived tasks |
| `dueDateFrom` | date | - | Filter tasks due after this date (ISO 8601) |
| `dueDateTo` | date | - | Filter tasks due before this date (ISO 8601) |
| `sortBy` | string | -createdAt | Sort field (prefix with - for descending) |

**Example Request:**
```http
GET /api/v1/tasks?page=1&limit=20&status=todo&priority=high&sortBy=-dueDate
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 20,
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Complete project documentation",
      "description": "Write comprehensive API docs",
      "status": "todo",
      "priority": "high",
      "dueDate": "2024-12-31T00:00:00.000Z",
      "createdBy": "507f1f77bcf86cd799439012",
      "assignedTo": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "tags": ["documentation", "api"],
      "category": "development",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Create Task

**POST** `/tasks`

**Auth Required:** Yes

**Rate Limit:** 20 requests per minute

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "status": "todo",
  "priority": "high",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "tags": ["documentation", "api"],
  "category": "development",
  "estimatedTime": 120
}
```

**Required Fields:** `title`

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Complete project documentation",
    "status": "todo",
    "priority": "high",
    "createdBy": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get Single Task

**GET** `/tasks/:id`

**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Complete project documentation",
    "description": "Write comprehensive API docs",
    "status": "todo",
    "priority": "high",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe"
    },
    "assignedTo": { ... },
    "tags": ["documentation", "api"],
    "subtasks": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error:** `404 Not Found`
```json
{
  "success": false,
  "message": "Task not found"
}
```

---

### Update Task

**PUT** `/tasks/:id`

**Auth Required:** Yes (must be task owner)

**Request Body:**
```json
{
  "title": "Updated title",
  "status": "in-progress",
  "priority": "urgent",
  "actualTime": 90
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated title",
    "status": "in-progress",
    "priority": "urgent",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

---

### Delete Task

**DELETE** `/tasks/:id`

**Auth Required:** Yes (must be task owner)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Task deleted successfully"
  }
}
```

---

### Get Task Statistics

**GET** `/tasks/stats`

**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 150,
    "todo": 45,
    "in-progress": 30,
    "completed": 70,
    "cancelled": 5,
    "overdue": 12
  }
}
```

---

### Get Overdue Tasks

**GET** `/tasks/overdue`

**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Overdue task",
      "dueDate": "2024-01-01T00:00:00.000Z",
      "status": "todo",
      "priority": "high"
    }
  ]
}
```

---

### Get Tasks Due Soon

**GET** `/tasks/due-soon`

**Auth Required:** Yes

**Query Parameters:**
- `hours` (optional, default: 24) - Number of hours to look ahead

**Example:**
```http
GET /api/v1/tasks/due-soon?hours=48
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

---

### Search Tasks

**GET** `/tasks/search`

**Auth Required:** Yes

**Query Parameters:**
- `q` (required) - Search query

**Example:**
```http
GET /api/v1/tasks/search?q=documentation
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 8,
  "data": [...]
}
```

---

### Bulk Update Tasks

**PATCH** `/tasks/bulk`

**Auth Required:** Yes

**Request Body:**
```json
{
  "taskIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ],
  "updates": {
    "status": "completed",
    "priority": "low"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "modifiedCount": 2,
    "message": "2 task(s) updated successfully"
  }
}
```

---

### Bulk Delete Tasks

**DELETE** `/tasks/bulk`

**Auth Required:** Yes

**Request Body:**
```json
{
  "taskIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "deletedCount": 2,
    "message": "2 task(s) deleted successfully"
  }
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Not authorized to access this route. Please login."
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Your account has been deactivated. Please contact support."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Task not found"
}
```

### Rate Limit Exceeded (429)
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later"
}
```

---

## PowerShell Examples

### List Tasks with Filters
```powershell
$token = "your_jwt_token"

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tasks?page=1&limit=10&status=todo&priority=high" `
  -Headers @{ Authorization = "Bearer $token" }
```

### Create Task
```powershell
$body = @{
    title = "New task"
    description = "Task description"
    priority = "high"
    dueDate = "2024-12-31T00:00:00.000Z"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tasks" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

### Update Task
```powershell
$body = @{
    status = "completed"
    actualTime = 120
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tasks/507f1f77bcf86cd799439011" `
  -Method PUT `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

### Delete Task
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tasks/507f1f77bcf86cd799439011" `
  -Method DELETE `
  -Headers @{ Authorization = "Bearer $token" }
```

### Search Tasks
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tasks/search?q=documentation" `
  -Headers @{ Authorization = "Bearer $token" }
```

---

## Best Practices

1. **Pagination**
   - Always use pagination for list endpoints
   - Adjust `limit` based on your needs (max 100)
   - Cache results when appropriate

2. **Filtering**
   - Combine multiple filters for precise results
   - Use date ranges for time-based queries
   - Use search for text-based queries

3. **Error Handling**
   - Always check `success` field
   - Handle rate limits with exponential backoff
   - Log errors for debugging

4. **Performance**
   - Use appropriate page sizes
   - Filter on indexed fields when possible
   - Use bulk operations for multiple updates

5. **Security**
   - Never expose tokens in logs
   - Use HTTPS in production
   - Implement token refresh logic
   - Handle 401 errors by redirecting to login
