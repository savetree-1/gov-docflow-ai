# Pravaah - Development Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [API Reference](#api-reference)
4. [Component Structure](#component-structure)
5. [Authentication & Authorization](#authentication--authorization)
6. [AI Integration](#ai-integration)
7. [Blockchain Integration](#blockchain-integration)
8. [Email System](#email-system)
9. [Development Guidelines](#development-guidelines)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Guide](#deployment-guide)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Port 3000)   │
└────────┬────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────┐      ┌──────────────┐
│  Express API    │◄────►│   MongoDB    │
│   (Port 5001)   │      │   Database   │
└────────┬────────┘      └──────────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌─────────────┐  ┌──────────────┐
│ Google      │  │   Polygon    │
│ Gemini AI   │  │  Blockchain  │
└─────────────┘  └──────────────┘
```

### Request Flow

1. User interacts with React frontend
2. Frontend sends authenticated API request
3. Express middleware validates JWT token
4. RBAC middleware checks permissions
5. Controller processes request
6. Service layer handles business logic
7. Database operations via Mongoose
8. Response sent back to frontend
9. Blockchain/Email triggered for specific actions

---

## Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  name: String (required, 2-100 chars),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: Enum ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'OFFICER', 'AUDITOR'],
  department: ObjectId (ref: Department, null for SUPER_ADMIN),
  phone: String (optional, +91-XXXXXXXXXX format),
  isApproved: Boolean (default: false),
  isActive: Boolean (default: true),
  lastLogin: Date,
  refreshToken: String (encrypted),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: email (unique), department, role

### Department Model

```javascript
{
  _id: ObjectId,
  name: String (required, unique, 3-200 chars),
  code: String (required, unique, 2-10 chars, uppercase),
  description: String (optional),
  contactEmail: String (required, unique),
  contactPhone: String (optional),
  nodalOfficer: {
    name: String (required),
    email: String (required),
    phone: String (required)
  },
  address: String (optional),
  approvalStatus: Enum ['Pending', 'Approved', 'Rejected'],
  approvedBy: ObjectId (ref: User, SUPER_ADMIN),
  approvedAt: Date,
  rejectionReason: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: name (unique), code (unique), contactEmail (unique)

### Document Model

```javascript
{
  _id: ObjectId,
  title: String (required, 5-500 chars),
  description: String (optional),
  category: Enum ['Policy', 'Circular', 'Order', 'Report', 'Request', 'Notice', 'Other'],
  referenceNumber: String (auto-generated, PRAVAAH-XXXXXXXX),
  fileUrl: String (required, path to uploaded file),
  fileType: String (MIME type),
  fileSize: Number (bytes, max 10MB),
  uploadedBy: ObjectId (ref: User, required),
  department: ObjectId (ref: Department, required),
  routedToDepartment: ObjectId (ref: Department, optional),
  aiSuggestions: {
    suggestedDepartment: ObjectId (ref: Department),
    confidence: Number (0-1),
    reasoning: String,
    summary: [String],
    extractedKeywords: [String]
  },
  status: Enum ['Pending', 'Reviewed', 'Approved', 'Rejected', 'Forwarded'],
  priority: Enum ['Low', 'Medium', 'High', 'Urgent'],
  approvalHistory: [{
    actionBy: ObjectId (ref: User),
    action: Enum ['Uploaded', 'Reviewed', 'Approved', 'Rejected', 'Forwarded', 'Deleted'],
    comments: String,
    timestamp: Date,
    department: ObjectId (ref: Department),
    blockchainTxHash: String
  }],
  currentAssignee: ObjectId (ref: User, optional),
  deadline: Date (optional),
  tags: [String],
  isDeleted: Boolean (default: false),
  deletedAt: Date,
  deletedBy: ObjectId (ref: User),
  metadata: Mixed (extensible for future fields),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: referenceNumber (unique), uploadedBy, department, status, routedToDepartment

### RoutingRule Model

```javascript
{
  _id: ObjectId,
  sourceDepartment: ObjectId (ref: Department, required),
  documentCategory: Enum ['Policy', 'Circular', 'Order', 'Report', 'Request', 'Notice', 'Other'],
  targetDepartment: ObjectId (ref: Department, required),
  keywords: [String],
  priority: Number (1-10, higher = more priority),
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: sourceDepartment, documentCategory, targetDepartment

---

## API Reference

### Authentication Endpoints

#### POST /api/auth/register
Register new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@pravah.gov.in",
  "password": "SecurePass@123",
  "role": "OFFICER",
  "department": "departmentId",
  "phone": "+91-9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Awaiting admin approval.",
  "data": {
    "userId": "...",
    "name": "John Doe",
    "email": "john.doe@pravah.gov.in",
    "role": "OFFICER",
    "isApproved": false
  }
}
```

**Validation Rules:**
- Name: 2-100 characters
- Email: Valid format, unique
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Role: Cannot create SUPER_ADMIN via API
- Department: Required for non-SUPER_ADMIN roles

#### POST /api/auth/login
Authenticate user and get tokens

**Request Body:**
```json
{
  "email": "user@pravah.gov.in",
  "password": "UserPass@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "name": "User Name",
      "email": "user@pravah.gov.in",
      "role": "OFFICER",
      "department": { ... }
    }
  }
}
```

**Token Expiry:**
- Access Token: 1 hour
- Refresh Token: 7 days

### Document Endpoints

#### GET /api/documents
List documents (role-based filtering)

**Query Parameters:**
- `status`: Filter by status (Pending, Approved, etc.)
- `category`: Filter by category
- `department`: Filter by department ID
- `search`: Text search in title/description
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10, max: 100)

**Authorization:**
- SUPER_ADMIN: All documents
- DEPARTMENT_ADMIN/OFFICER: Own department documents
- AUDITOR: Read-only access to all

**Response:**
```json
{
  "success": true,
  "data": [...documents],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

#### POST /api/documents
Upload new document

**Content-Type:** multipart/form-data

**Form Fields:**
- `file`: Document file (PDF, DOC, DOCX, JPG, PNG, max 10MB)
- `title`: Document title (required)
- `description`: Optional description
- `category`: Document category (required)
- `priority`: Low/Medium/High/Urgent
- `deadline`: Optional ISO date string

**Authorization:** All authenticated users

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "documentId": "...",
    "referenceNumber": "PRAVAAH-A1B2C3D4",
    "aiSuggestions": {
      "suggestedDepartment": { ... },
      "confidence": 0.85,
      "reasoning": "...",
      "summary": [...]
    }
  }
}
```

**Process Flow:**
1. File validated and saved to `/uploads`
2. AI analysis triggered (Gemini)
3. Department routing suggested
4. Blockchain log created
5. Notifications sent to suggested department

---

## Component Structure

### Frontend Architecture

```
src/
├── components/          # Reusable components
│   ├── alerts/         # Alert/notification components
│   ├── dashboardShared/ # Shared dashboard components
│   ├── dashboardSidebar/ # Sidebar navigation
│   ├── footer/         # Footer component
│   ├── header/         # Header/navigation
│   └── ...
│
├── pages/              # Route-level components
│   ├── dashboards/     # Role-specific dashboards
│   │   ├── SuperAdminDashboard.jsx
│   │   ├── DepartmentAdminDashboard.jsx
│   │   └── OfficerDashboard.jsx
│   ├── documentDetail/ # Document viewing
│   ├── userManagement/ # User CRUD
│   └── ...
│
├── api/                # API integration layer
│   └── backendAPI.js   # Axios instance + endpoints
│
├── redux/              # State management
│   ├── store.js
│   ├── actions/
│   └── reducers/
│
├── constants/          # Application constants
│   └── auth.js         # Roles, permissions
│
└── utils/              # Utility functions
    └── validation.js   # Form validation
```

### Component Best Practices

1. **Functional Components**: Use hooks, avoid class components
2. **Props Validation**: Use PropTypes for type checking
3. **State Management**: Local state for UI, Redux for global state
4. **Code Splitting**: Lazy load routes for performance
5. **Error Boundaries**: Wrap components for graceful error handling

---

## Authentication & Authorization

### JWT Token Structure

**Access Token Payload:**
```json
{
  "userId": "64abc123...",
  "role": "OFFICER",
  "department": { ... },
  "iat": 1234567890,
  "exp": 1234571490
}
```

### RBAC Middleware

**Permission Matrix:**

| Endpoint | SUPER_ADMIN | DEPT_ADMIN | OFFICER | AUDITOR |
|----------|-------------|------------|---------|---------|
| Upload Document | ✓ | ✓ | ✓ | ✗ |
| View Documents | All | Department | Department | All (Read) |
| Approve Document | ✓ | ✓ | ✗ | ✗ |
| Create User | ✓ | ✓ (Dept) | ✗ | ✗ |
| Approve Department | ✓ | ✗ | ✗ | ✗ |
| View System Logs | ✓ | ✗ | ✗ | ✓ |

**Middleware Usage:**
```javascript
router.get('/sensitive-route', 
  authenticateToken,           // Verify JWT
  requireRole('SUPER_ADMIN'),  // Check role
  controller.handleRequest
);
```

---

## AI Integration

### Google Gemini Document Analysis

**Service Location:** `/backend/services/aiProcessingService.js`

**Process:**
1. Document text extracted (PDF parsing)
2. Text sent to Gemini API with prompt
3. Response parsed for:
   - Department routing suggestion
   - Confidence score
   - Reasoning explanation
   - Document summary (5 key points)
   - Extracted keywords

**Prompt Template:**
```
You are an AI assistant for Uttarakhand Government document routing.
Analyze this document and provide:
1. Suggested department (name only)
2. Confidence level (0-1)
3. Routing reasoning
4. 5-point summary
5. Relevant keywords

Document: [CONTENT]
Available Departments: [LIST]
```

**Error Handling:**
- API failures fallback to manual routing
- Confidence < 0.5 marked for manual review
- Retry logic with exponential backoff

---

## Blockchain Integration

### Smart Contract

**File:** `/blockchain/contracts/DocumentAudit.sol`

**Functions:**
- `logAction()`: Record document action
- `getAllActions()`: Get audit trail
- `getActionCount()`: Count actions

**Action Structure:**
```solidity
struct Action {
    string documentId;
    string actionType;
    address performer;
    uint256 timestamp;
    string details;
}
```

**Integration Points:**
1. Document upload
2. Status change (approve/reject/forward)
3. Deletion
4. Routing confirmation

**Gas Optimization:**
- Batch operations where possible
- Store hashes, not full data
- Use events for external indexing

---

## Email System

### Nodemailer Configuration

**Service:** `/backend/services/emailService.js`

**Email Templates:**
1. Document routed notification
2. Status update notification
3. User approval notification
4. Department approval notification

**Template Structure:**
```html
<div style="font-family: Arial">
  <h1>Pravaah</h1>
  <p>Dear [NAME],</p>
  <p>[MESSAGE]</p>
  <table>[DETAILS]</table>
  <footer>Pravaah Document Management System</footer>
</div>
```

**Sending Process:**
```javascript
await emailService.sendRoutingNotification({
  to: 'user@pravah.gov.in',
  documentTitle: '...',
  referenceNumber: 'PRAVAAH-...',
  routedBy: '...',
  department: '...'
});
```

---

## Development Guidelines

### Code Style

**JavaScript/React:**
- Use ES6+ features
- 2-space indentation
- Semicolons required
- Meaningful variable names
- Comments for complex logic

**File Naming:**
- Components: PascalCase (e.g., `UserDashboard.jsx`)
- Utilities: camelCase (e.g., `formatDate.js`)
- Constants: UPPER_SNAKE_CASE (e.g., `USER_ROLES`)

### Git Workflow

1. Create feature branch: `feature/document-versioning`
2. Commit with descriptive messages: `feat: Add document version control`
3. Push and create pull request
4. Code review required before merge
5. Merge to `develop` branch
6. Deploy to staging for testing
7. Merge to `master` for production

### Error Handling

**Backend:**
```javascript
try {
  // Operation
} catch (error) {
  console.error('Error context:', error);
  return res.status(500).json({
    success: false,
    message: 'User-friendly error message',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

**Frontend:**
```javascript
try {
  const response = await API.call();
  // Handle success
} catch (error) {
  setError(error.response?.data?.message || 'Operation failed');
  console.error(error);
}
```

---

## Testing Strategy

### Unit Tests
- Test individual functions/components
- Mock external dependencies
- Aim for 80%+ code coverage

### Integration Tests
- Test API endpoints end-to-end
- Use test database
- Verify authentication/authorization

### E2E Tests (Future)
- Cypress for user flow testing
- Test critical paths (login → upload → approve)

**Test Commands:**
```bash
npm test                # Run all tests
npm test -- --coverage  # With coverage report
npm test -- --watch     # Watch mode
```

---

## Deployment Guide

### Production Checklist

**Environment Variables:**
- [ ] Change JWT secrets
- [ ] Use production MongoDB cluster
- [ ] Configure production email SMTP
- [ ] Set Gemini API key
- [ ] Update blockchain contract address
- [ ] Set NODE_ENV=production

**Security:**
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set secure cookie flags
- [ ] Enable rate limiting
- [ ] Configure firewall rules

**Performance:**
- [ ] Enable compression middleware
- [ ] Set up CDN for static assets
- [ ] Configure MongoDB indexes
- [ ] Enable query optimization
- [ ] Set up monitoring (PM2, New Relic)

**Backup:**
- [ ] Automated database backups
- [ ] Document file backups (S3)
- [ ] Disaster recovery plan

### Deployment Commands

**Backend (PM2):**
```bash
cd backend
npm install --production
pm2 start server.js --name pravaah-api
pm2 save
pm2 startup
```

**Frontend (Build):**
```bash
npm run build
# Deploy build/ folder to Netlify/Vercel
```

---

## Troubleshooting

### Common Issues

**"JWT token expired"**
- Solution: Refresh token endpoint not working, clear localStorage and re-login

**"MongoDB connection failed"**
- Check MONGO_URI in .env
- Verify IP whitelist in MongoDB Atlas
- Ensure network connectivity

**"File upload fails"**
- Check file size (max 10MB)
- Verify MIME type is allowed
- Ensure uploads/ directory is writable

**"Blockchain transaction failed"**
- Check MetaMask balance (need MATIC for gas)
- Verify contract address is correct
- Check Polygon Amoy network status

---

**Document Version:** 1.0.0  
**Last Updated:** December 31, 2025  
**Maintainer:** Tech Titans Development Team
