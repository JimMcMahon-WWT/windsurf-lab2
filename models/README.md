# Database Models

Comprehensive documentation for Mongoose schemas in the Task Management API.

## Table of Contents
- [User Model](#user-model)
- [Task Model](#task-model)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Methods](#methods)

---

## User Model

### Schema Fields

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `username` | String | Yes | Yes | Unique username (3-30 chars, alphanumeric) |
| `name` | String | Yes | No | User's full name (2-50 chars) |
| `email` | String | Yes | Yes | User's email address |
| `password` | String | Yes | No | Hashed password (min 6 chars) |
| `refreshToken` | String | No | No | JWT refresh token |
| `avatar` | String | No | No | Profile picture URL |
| `bio` | String | No | No | User biography (max 500 chars) |
| `isActive` | Boolean | No | No | Account active status (default: true) |
| `isEmailVerified` | Boolean | No | No | Email verification status |
| `lastLogin` | Date | No | No | Last login timestamp |
| `preferences` | Object | No | No | User preferences (theme, notifications, language) |
| `createdAt` | Date | Auto | No | Account creation timestamp |
| `updatedAt` | Date | Auto | No | Last update timestamp |

### Security Fields (select: false)

- `emailVerificationToken` - Token for email verification
- `emailVerificationExpires` - Expiration date for verification token
- `passwordResetToken` - Token for password reset
- `passwordResetExpires` - Expiration date for reset token
- `passwordChangedAt` - Timestamp of last password change
- `loginAttempts` - Failed login attempt counter
- `lockUntil` - Account lock expiration date

### Indexes

```javascript
{ email: 1 } // Unique
{ username: 1 } // Unique
{ isActive: 1, createdAt: -1 }
{ lastLogin: -1 }
```

### Virtuals

- `profileUrl` - Returns `/api/v1/users/{id}`
- `isLocked` - Returns true if account is currently locked

### Instance Methods

```javascript
// Password comparison
user.comparePassword(candidatePassword) // Returns Promise<boolean>

// Check if password changed after JWT issued
user.changedPasswordAfter(JWTTimestamp) // Returns boolean

// Login attempt management
user.incLoginAttempts() // Increment failed login attempts
user.resetLoginAttempts() // Reset login attempts to 0

// JSON serialization (removes sensitive fields)
user.toJSON() // Returns sanitized user object
```

### Static Methods

```javascript
// Find by email or username
User.findByIdentifier(identifier) // Returns Promise<User>

// Get active users count
User.getActiveUsersCount() // Returns Promise<number>
```

### Middleware Hooks

- **Pre-save**: Hash password if modified
- **Pre-save**: Update `passwordChangedAt` on password change
- **Pre-save**: Reset login attempts on successful login

### Example Usage

```javascript
const User = require('./models/User');

// Create user
const user = await User.create({
  username: 'johndoe',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});

// Find by identifier
const foundUser = await User.findByIdentifier('johndoe');

// Compare password
const isValid = await user.comparePassword('password123');

// Update preferences
user.preferences.theme = 'dark';
await user.save();
```

---

## Task Model

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Task title (1-200 chars) |
| `description` | String | No | Task description (max 1000 chars) |
| `status` | String | No | Status: todo, in-progress, completed, cancelled |
| `priority` | String | No | Priority: low, medium, high, urgent |
| `dueDate` | Date | No | Task due date |
| `startDate` | Date | No | Task start date |
| `completedAt` | Date | No | Completion timestamp |
| `createdBy` | ObjectId | Yes | Reference to User (creator) |
| `assignedTo` | ObjectId | No | Reference to User (assignee) |
| `tags` | [String] | No | Array of tags |
| `category` | String | No | Task category |
| `estimatedTime` | Number | No | Estimated time in minutes |
| `actualTime` | Number | No | Actual time spent in minutes |
| `attachments` | [Object] | No | File attachments |
| `subtasks` | [Object] | No | Array of subtasks |
| `isArchived` | Boolean | No | Archive status (default: false) |
| `notes` | String | No | Additional notes (max 2000 chars) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Subtask Schema

```javascript
{
  title: String (required),
  completed: Boolean (default: false),
  completedAt: Date
}
```

### Attachment Schema

```javascript
{
  filename: String,
  url: String,
  size: Number,
  mimeType: String,
  uploadedAt: Date (default: now)
}
```

### Indexes

```javascript
// Compound indexes for efficient queries
{ createdBy: 1, status: 1 }
{ createdBy: 1, priority: 1 }
{ createdBy: 1, dueDate: 1 }
{ createdBy: 1, createdAt: -1 }
{ assignedTo: 1, status: 1 }
{ status: 1, priority: -1, dueDate: 1 }
{ tags: 1 }
{ category: 1 }
{ isArchived: 1, createdBy: 1 }

// Text index for search
{ title: 'text', description: 'text', tags: 'text' }
```

### Virtuals

- `isOverdue` - Returns true if task is past due date
- `isDueSoon` - Returns true if task is due within 24 hours
- `subtaskProgress` - Returns completion percentage of subtasks
- `timeVariance` - Returns difference between estimated and actual time

### Instance Methods

```javascript
// Status management
task.complete() // Mark as completed
task.cancel() // Mark as cancelled
task.archive() // Archive task

// Subtask management
task.addSubtask(title) // Add new subtask
task.toggleSubtask(subtaskId) // Toggle subtask completion

// Tag management
task.addTag(tag) // Add tag
task.removeTag(tag) // Remove tag
```

### Static Methods

```javascript
// Find tasks by status
Task.findByUserAndStatus(userId, status) // Returns Promise<Task[]>

// Find overdue tasks
Task.findOverdue(userId) // Returns Promise<Task[]>

// Find tasks due soon
Task.findDueSoon(userId, hours) // Returns Promise<Task[]>

// Search tasks
Task.searchTasks(userId, searchText) // Returns Promise<Task[]>

// Get statistics
Task.getStatistics(userId) // Returns Promise<Object>
```

### Middleware Hooks

- **Pre-save**: Set `completedAt` when status changes to completed
- **Pre-save**: Auto-assign task to creator if not assigned
- **Pre-save**: Update subtask `completedAt` timestamps

### Example Usage

```javascript
const Task = require('./models/Task');

// Create task
const task = await Task.create({
  title: 'Complete project documentation',
  description: 'Write comprehensive API docs',
  status: 'todo',
  priority: 'high',
  dueDate: new Date('2024-12-31'),
  createdBy: userId,
  tags: ['documentation', 'api']
});

// Add subtask
await task.addSubtask('Write User model docs');
await task.addSubtask('Write Task model docs');

// Check if overdue
if (task.isOverdue) {
  console.log('Task is overdue!');
}

// Get subtask progress
console.log(`Progress: ${task.subtaskProgress}%`);

// Find overdue tasks
const overdueTasks = await Task.findOverdue(userId);

// Search tasks
const results = await Task.searchTasks(userId, 'documentation');

// Get statistics
const stats = await Task.getStatistics(userId);
console.log(stats); // { total: 10, todo: 3, 'in-progress': 2, completed: 5, overdue: 1 }
```

---

## Relationships

### User → Tasks (One-to-Many)

```javascript
// Get all tasks created by a user
const tasks = await Task.find({ createdBy: userId });

// Get all tasks assigned to a user
const assignedTasks = await Task.find({ assignedTo: userId });

// Populate creator information
const task = await Task.findById(taskId).populate('createdBy', 'name email username');
```

### Task → User (Many-to-One)

```javascript
// Populate task with user information
const task = await Task.findById(taskId)
  .populate('createdBy', 'name email avatar')
  .populate('assignedTo', 'name email avatar');
```

---

## Indexes

### Why These Indexes?

1. **Unique Indexes** (`email`, `username`)
   - Ensure data integrity
   - Fast lookups for authentication

2. **Compound Indexes** (`createdBy + status`, `createdBy + priority`)
   - Optimize filtered queries
   - Support common query patterns

3. **Text Indexes** (`title`, `description`, `tags`)
   - Enable full-text search
   - Improve search performance

4. **Single Field Indexes** (`isActive`, `lastLogin`, `dueDate`)
   - Speed up sorting and filtering
   - Support common query conditions

### Index Performance

```javascript
// These queries will use indexes efficiently:
User.find({ email: 'john@example.com' }); // Uses email index
User.find({ isActive: true }).sort({ createdAt: -1 }); // Uses compound index
Task.find({ createdBy: userId, status: 'todo' }); // Uses compound index
Task.find({ $text: { $search: 'documentation' } }); // Uses text index
```

---

## Validation

### User Validation

- **Username**: 3-30 characters, alphanumeric with underscores/hyphens
- **Email**: Valid email format
- **Password**: Minimum 6 characters (hashed automatically)
- **Name**: 2-50 characters
- **Bio**: Maximum 500 characters

### Task Validation

- **Title**: 1-200 characters (required)
- **Description**: Maximum 1000 characters
- **Status**: Must be one of: todo, in-progress, completed, cancelled
- **Priority**: Must be one of: low, medium, high, urgent
- **Due Date**: Must be in the future for new tasks
- **Estimated/Actual Time**: Cannot be negative
- **Tags**: Maximum 30 characters each
- **Notes**: Maximum 2000 characters

---

## Best Practices

### 1. Always Use Lean Queries When Possible

```javascript
// Faster for read-only operations
const tasks = await Task.find({ createdBy: userId }).lean();
```

### 2. Select Only Required Fields

```javascript
// Reduce data transfer
const users = await User.find().select('name email avatar');
```

### 3. Use Populate Sparingly

```javascript
// Only populate when needed
const task = await Task.findById(taskId)
  .populate('createdBy', 'name email'); // Only select needed fields
```

### 4. Leverage Static Methods

```javascript
// Use built-in methods for common queries
const stats = await Task.getStatistics(userId);
const overdue = await Task.findOverdue(userId);
```

### 5. Handle Validation Errors

```javascript
try {
  await user.save();
} catch (error) {
  if (error.name === 'ValidationError') {
    // Handle validation errors
    console.log(error.errors);
  }
}
```

---

## Migration Notes

### From Old Schema to New Schema

If upgrading from the basic schema:

1. **Add username field** to existing users
2. **Rename `user` to `createdBy`** in tasks (alias provided for compatibility)
3. **Update indexes** in MongoDB
4. **Run migration script** to populate new fields

```javascript
// Migration example
const users = await User.find();
for (const user of users) {
  if (!user.username) {
    user.username = user.email.split('@')[0];
    await user.save();
  }
}
```
