# API Quick Reference

Quick reference guide for the Task Management API endpoints.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication Header
```http
Authorization: Bearer <token>
```

---

## Endpoints Summary

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login user |
| POST | `/auth/refresh` | No | Refresh access token |
| GET | `/auth/me` | Yes | Get current user |

### Tasks - Standard CRUD
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks` | Yes | List tasks (paginated) |
| POST | `/tasks` | Yes | Create task |
| GET | `/tasks/:id` | Yes | Get single task |
| PUT | `/tasks/:id` | Yes | Update task |
| DELETE | `/tasks/:id` | Yes | Delete task |

### Tasks - Special Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks/stats` | Yes | Get task statistics |
| GET | `/tasks/overdue` | Yes | Get overdue tasks |
| GET | `/tasks/due-soon` | Yes | Get tasks due soon |
| GET | `/tasks/search?q=` | Yes | Search tasks |
| PATCH | `/tasks/bulk` | Yes | Bulk update tasks |
| DELETE | `/tasks/bulk` | Yes | Bulk delete tasks |

---

## Common Query Parameters

### GET /tasks
```
?page=1                    # Page number (default: 1)
&limit=10                  # Items per page (default: 10, max: 100)
&status=todo               # Filter by status
&priority=high             # Filter by priority
&category=work             # Filter by category
&tags=urgent,important     # Filter by tags
&search=documentation      # Full-text search
&isArchived=false          # Show archived (default: false)
&dueDateFrom=2024-01-01    # Due date range start
&dueDateTo=2024-12-31      # Due date range end
&sortBy=-createdAt         # Sort field (- for descending)
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Created (POST) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Server Error |

---

## Request Examples

### Register
```powershell
$body = @{
    username = "johndoe"
    name = "John Doe"
    email = "john@example.com"
    password = "SecureP@ss123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" `
  -Method POST -ContentType "application/json" -Body $body
```

### Login
```powershell
$body = @{
    identifier = "johndoe"
    password = "SecureP@ss123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" `
  -Method POST -ContentType "application/json" -Body $body

$token = $response.data.token
```

### List Tasks
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tasks?page=1&limit=20&status=todo" `
  -Headers @{ Authorization = "Bearer $token" }
```

### Create Task
```powershell
$body = @{
    title = "New task"
    description = "Task description"
    priority = "high"
    dueDate = "2024-12-31"
    tags = @("work", "urgent")
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

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tasks/TASK_ID" `
  -Method PUT `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

### Delete Task
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tasks/TASK_ID" `
  -Method DELETE `
  -Headers @{ Authorization = "Bearer $token" }
```

### Search Tasks
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tasks/search?q=documentation" `
  -Headers @{ Authorization = "Bearer $token" }
```

### Get Statistics
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tasks/stats" `
  -Headers @{ Authorization = "Bearer $token" }
```

### Bulk Update
```powershell
$body = @{
    taskIds = @("TASK_ID_1", "TASK_ID_2")
    updates = @{
        status = "completed"
        priority = "low"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tasks/bulk" `
  -Method PATCH `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

---

## Field Values

### Status
- `todo`
- `in-progress`
- `completed`
- `cancelled`

### Priority
- `low`
- `medium`
- `high`
- `urgent`

### Sort Fields
- `createdAt` (default: descending)
- `updatedAt`
- `dueDate`
- `priority`
- `status`
- `title`

Prefix with `-` for descending order (e.g., `-createdAt`)

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/auth/register` | 3 per hour |
| `/auth/login` | 5 per 15 min |
| `/tasks` (POST) | 20 per minute |
| General API | 100 per 15 min |

---

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Tips

1. **Always check `success` field** in responses
2. **Use pagination** for list endpoints
3. **Handle rate limits** with exponential backoff
4. **Store tokens securely** (not in localStorage for sensitive apps)
5. **Implement token refresh** logic
6. **Use HTTPS** in production
7. **Filter on indexed fields** for better performance
8. **Use bulk operations** for multiple updates
