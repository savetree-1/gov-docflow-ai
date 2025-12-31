# Government Document Flow Management System - Backend

## Overview
Complete backend API for the Government Document Flow Management System (Pravaah). Built with Node.js, Express, MongoDB, and JWT authentication.

## Features
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (4 roles: Super Admin, Department Admin, Officer, Auditor)
- ✅ Document upload with auto-routing
- ✅ Document approval workflow
- ✅ User management
- ✅ Department registration & approval
- ✅ Routing rules configuration
- ✅ Complete audit logging
- ✅ File upload with validation (PDF, DOC, DOCX, JPG, PNG - 10MB max)
- ✅ MongoDB Atlas integration

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB (Mongoose 7.5.0)
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcryptjs 2.4.3
- **File Upload**: Multer 1.4.5
- **Environment**: dotenv 16.3.1
- **CORS**: cors 2.8.5

## Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
Create `.env` file in the backend directory:
```env
MONGO_URI=mongodb+srv://pravah_user:dummy123@cluster0.jjzpsjs.mongodb.net/pravah_prototype?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production_2024
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_change_in_production_2024
PORT=5001
NODE_ENV=development
```

### 3. Seed Database
Create test users and departments:
```bash
node seed.js
```

This creates:
- 5 test users (Super Admin, 2 Department Admins, Officer, Auditor)
- 3 departments (Finance, Land & Revenue, HR)

### 4. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server starts on `http://localhost:5001`

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@gov.in | Admin@123 |
| Department Admin (Finance) | finance@gov.in | Finance@123 |
| Department Admin (Land) | land@gov.in | Land@123 |
| Officer | officer@gov.in | Officer@123 |
| Auditor | auditor@gov.in | Auditor@123 |

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login with email & password
- `POST /logout` - Logout current user
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password

### Documents (`/api/documents`)
- `POST /upload` - Upload new document (multipart/form-data)
- `GET /` - Get all documents (with filters: category, status, urgency, search)
- `GET /:id` - Get document by ID
- `PUT /:id/action` - Perform action (approve/reject/forward)
- `DELETE /:id` - Delete document (Super Admin only)
- `GET /stats/overview` - Get document statistics

### Users (`/api/users`)
- `GET /` - Get all users (Admin only)
- `GET /:id` - Get user by ID
- `POST /` - Create new user (Admin only)
- `PUT /:id` - Update user (Admin only)
- `PUT /:id/approve` - Approve user (Super Admin only)
- `DELETE /:id` - Deactivate user (Super Admin only)
- `GET /stats/overview` - Get user statistics (Super Admin only)

### Departments (`/api/departments`)
- `POST /register` - Register new department
- `GET /` - Get all departments
- `GET /:id` - Get department by ID
- `PUT /:id/approve` - Approve department (Super Admin only)
- `PUT /:id/reject` - Reject department (Super Admin only)
- `PUT /:id` - Update department
- `GET /stats/overview` - Get department statistics (Super Admin only)

### Routing Rules (`/api/routing`)
- `POST /` - Create routing rule (Admin only)
- `GET /` - Get all routing rules
- `GET /:id` - Get routing rule by ID
- `PUT /:id` - Update routing rule (Admin only)
- `DELETE /:id` - Delete routing rule (Admin only)
- `POST /test` - Test routing rule matching

### Audit Logs (`/api/audit`)
- `GET /` - Get all audit logs (Admin/Auditor only)
- `GET /:id` - Get audit log by ID
- `GET /document/:documentId` - Get logs for specific document
- `GET /user/:userId` - Get logs for specific user
- `GET /stats/overview` - Get audit statistics
- `GET /export/csv` - Export audit logs as CSV

## Database Models

### User
- firstName, lastName, email, password (hashed)
- employeeId (unique), phone
- role: SUPER_ADMIN | DEPARTMENT_ADMIN | OFFICER | AUDITOR
- department (reference to Department)
- isActive, isApproved
- preferences (notifications, language)

### Document
- title, referenceNumber (auto-generated)
- category: finance | land | hr | infrastructure | policy | legal | other
- urgency: Low | Medium | High
- status: Pending | In_Progress | Approved | Rejected | Completed
- fileUrl, fileName, fileType, fileSize
- uploadedBy, assignedTo, department (references)
- actionHistory (array of actions with timestamps)
- tags, description, deadline

### Department
- name, code (unique)
- nodalOfficer (name, email, phone, designation)
- status: Pending | Approved | Rejected
- isActive
- approvedBy, approvedAt, rejectionReason

### RoutingRule
- name, department (reference)
- conditions (category, urgency, keywords)
- assignTo (reference to User)
- priority (higher = matched first)
- isActive
- createdBy (reference to User)

### AuditLog
- action (20+ predefined actions)
- performedBy (reference to User)
- targetUser, targetDocument, targetDepartment (references)
- details, metadata
- ipAddress, userAgent, timestamp

## Authentication Flow

1. **Login**: POST `/api/auth/login` with email & password
2. **Response**: Returns `accessToken` (1h expiry) and `refreshToken` (7d expiry)
3. **Authorization**: Include `Authorization: Bearer <accessToken>` in all protected requests
4. **Token Refresh**: When accessToken expires, POST to `/api/auth/refresh` with refreshToken
5. **Logout**: POST `/api/auth/logout` (logs audit trail)

## File Upload

Documents are uploaded to `uploads/documents/` directory with unique filenames:
- Format: `DOC-{timestamp}-{random}.{ext}`
- Max size: 10MB
- Allowed types: PDF, DOC, DOCX, JPG, PNG
- Auto-routing based on category/urgency

## Role Permissions

### Super Admin
- Full system access
- User management (create, approve, deactivate)
- Department approval/rejection
- View all documents and audit logs
- Configure routing rules
- System-wide statistics

### Department Admin
- Manage users within their department
- View department documents
- Create/manage routing rules for their department
- Approve/reject documents
- Department-level statistics

### Officer
- Upload documents
- View assigned documents
- Approve/reject/forward documents
- Update profile

### Auditor
- Read-only access to all documents
- Full audit log access
- Export audit reports
- View system statistics
- Cannot perform document actions

## Auto-Routing Logic

When a document is uploaded:
1. System finds matching routing rule based on:
   - Department
   - Category (exact match or 'any')
   - Urgency (exact match or 'any')
   - Keywords (optional)
2. Rules are prioritized by `priority` field (descending)
3. Document is auto-assigned to the user specified in the matched rule
4. If no rule matches, document stays unassigned (Pending)

## Audit Logging

All critical actions are automatically logged:
- Authentication (login, logout, password change)
- Document operations (upload, view, approve, reject, forward, delete)
- User management (create, update, delete, approve)
- Department operations (register, approve, reject)
- Routing rule changes (create, update, delete)
- Settings updates

Each log includes:
- Action type
- Performer (user)
- Target (user/document/department)
- Timestamp
- IP address
- User agent
- Additional metadata

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT with short-lived access tokens (1h)
- Refresh token rotation
- Role-based access control on all routes
- Input validation
- File type & size validation
- CORS enabled with credentials
- XSS protection
- MongoDB injection prevention

## Error Handling

All API responses follow standard format:
```json
{
  "success": true/false,
  "message": "Human readable message",
  "data": {...} // Present on success
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Server Error

## Pagination

List endpoints support pagination:
```
GET /api/documents?page=1&limit=20
```

Response includes:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 156,
    "page": 1,
    "pages": 8
  }
}
```

## Development

```bash
# Install nodemon for auto-restart
npm install -D nodemon

# Run with auto-restart
npm run dev
```

## Production Deployment

1. Update `.env` with production values:
   - Strong JWT secrets
   - Production MongoDB URI
   - Set NODE_ENV=production

2. Ensure file upload directory exists and is writable:
   ```bash
   mkdir -p uploads/documents
   chmod 755 uploads
   ```

3. Start server:
   ```bash
   npm start
   ```

4. Use a process manager (PM2 recommended):
   ```bash
   npm install -g pm2
   pm2 start server.js --name pravah-backend
   pm2 save
   pm2 startup
   ```

5. Setup reverse proxy (Nginx) for HTTPS

## Project Structure
```
backend/
├── server.js              # Main entry point
├── package.json           # Dependencies
├── .env                   # Environment variables
├── seed.js               # Database seeding script
├── models/               # Mongoose schemas
│   ├── User.js
│   ├── Document.js
│   ├── Department.js
│   ├── RoutingRule.js
│   └── AuditLog.js
├── routes/               # API route handlers
│   ├── auth.js           # Authentication routes
│   ├── documents.js      # Document management
│   ├── users.js          # User management
│   ├── departments.js    # Department management
│   ├── routing.js        # Routing rules
│   └── audit.js          # Audit logs
├── middleware/           # Custom middleware
│   └── auth.js           # JWT verification, role checks
└── uploads/              # File upload storage
    └── documents/        # Uploaded documents
```

## API Testing

Use Postman, Thunder Client, or curl:

### Login Example
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gov.in","password":"Admin@123"}'
```

### Upload Document Example
```bash
curl -X POST http://localhost:5001/api/documents/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@document.pdf" \
  -F "title=Budget Report 2024" \
  -F "category=finance" \
  -F "urgency=High" \
  -F "description=Annual budget report"
```

## Troubleshooting

### MongoDB Connection Failed
- Verify MongoDB URI in `.env`
- Check network access in MongoDB Atlas
- Ensure IP whitelist includes your server IP

### Port Already in Use
```bash
# Find process using port 5001
lsof -ti:5001

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5002 npm start
```

### File Upload Fails
- Check `uploads/documents` directory exists
- Verify write permissions
- Check file size < 10MB
- Verify file type is allowed

## Support & Documentation

For frontend integration, see `/src/api/backendAPI.js`

## License

Government of India - Internal Use Only
