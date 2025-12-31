# Authentication & Access Control System - Implementation Guide
## Government Internal Web Platform (Uttarakhand)

**Date:** December 28, 2025  
**System Type:** Closed Government Platform  
**Access Model:** Role-Based, Admin-Controlled, No Public Signup

---

## 🎯 System Overview

This is a **secure, auditable authentication and authorization system** designed for Uttarakhand Government's internal document management platform. The system enforces strict access controls with **no public signup** and **complete audit trails**.

### Key Principles
- ✅ Closed system - no citizen access
- ✅ No open signup - all accounts admin-controlled
- ✅ Fixed user roles (not editable via UI)
- ✅ Backend-enforced authorization
- ✅ Complete audit logging
- ✅ Department-level isolation
- ✅ Government email verification

---

## 👥 User Roles (Fixed & Hardcoded)

### 1. SUPER_ADMIN
**Created:** Manually at deployment (seed script)  
**Represents:** State IT Cell / NIC / Nodal Authority

**Permissions:**
- Approve/reject department registration requests
- Create Department Admins
- View system-wide audit logs
- Manage all departments

**Restrictions:**
- Cannot upload or act on documents
- Cannot be created via UI

### 2. DEPARTMENT_ADMIN
**Created:** Only by Super Admin  
**Represents:** Department-level administrator

**Permissions:**
- Create Officers and Auditors within own department
- Manage users (suspend/activate)
- View department-scoped logs
- Define routing rules

**Restrictions:**
- Cannot access other departments
- Cannot approve department registrations

### 3. OFFICER
**Created:** Only by Department Admin  
**Represents:** Daily operational users

**Permissions:**
- Upload documents
- View assigned documents
- Take actions on documents
- Forward/route documents

**Restrictions:**
- Limited to own department
- Cannot manage users

### 4. AUDITOR
**Created:** Only by Department Admin  
**Represents:** Read-only oversight role

**Permissions:**
- View documents (read-only)
- View audit logs (read-only)

**Restrictions:**
- Cannot upload, edit, or route
- All write operations blocked
- Limited to own department

---

## 🔐 Authentication Flow

### Login Process

```
User enters credentials (Email/Employee ID + Password)
          ↓
Backend validates:
  - User exists?
  - Account status = ACTIVE?
  - Password correct (bcrypt)?
          ↓
Generate JWT token with:
  - sub: userId
  - role: USER_ROLE
  - departmentId
  - jti: unique token ID
  - exp: 30 minutes
          ↓
Log successful login (IP, UA, timestamp)
          ↓
Return token + user profile
          ↓
Frontend stores token + user in localStorage
          ↓
Redirect based on role
```

### Logout Process

```
User clicks logout
          ↓
Frontend calls /auth/logout
          ↓
Backend revokes session (mark jti as inactive)
          ↓
Log logout event
          ↓
Clear localStorage
          ↓
Redirect to login
```

---

## 🚫 No Public Signup - Controlled Onboarding

### Department Registration Flow (NOT Signup)

```
1. Department Nodal Officer visits /department-registration
          ↓
2. Fills form:
   - Department name
   - Level (State/District)
   - Nodal officer details
   - Official government email
          ↓
3. System creates PENDING registration request
   (No account created yet)
          ↓
4. Super Admin receives notification
          ↓
5. Super Admin reviews request
          ↓
6a. APPROVED:
    - Create Department (ACTIVE)
    - Create Department Admin user
    - Generate temporary password
    - Send credentials via email
          ↓
6b. REJECTED:
    - Mark request as REJECTED
    - Store rejection reason
    - Notify applicant
```

### User Creation Flow

```
Department Admin creates Officer/Auditor:
          ↓
1. Select role (OFFICER or AUDITOR)
2. Enter user details (name, email, employee ID)
3. Validate official email domain
          ↓
4. System generates temporary password
5. Create user account (status: ACTIVE)
6. Send credentials via secure channel
          ↓
User receives credentials → Logs in → Changes password
```

---

## 🛡️ Authorization (RBAC)

### Backend Middleware Stack

```javascript
// Example: Protecting an endpoint
router.post('/documents/upload',
  requireAuth,                              // 1. Verify JWT
  requireRole(USER_ROLES.OFFICER),          // 2. Check role
  requirePermission('canUploadDocuments'),  // 3. Check permission
  requireDepartmentScope('departmentId'),   // 4. Verify department
  uploadHandler
);
```

### Department Isolation

```
SUPER_ADMIN: Access all departments
          ↓
DEPARTMENT_ADMIN: Access own department only
          ↓
OFFICER: Access own department only
          ↓
AUDITOR: Read-only access to own department
```

### Cross-Department Access Prevention

```javascript
// Middleware checks:
if (user.role !== 'SUPER_ADMIN') {
  if (requestedDepartmentId !== user.departmentId) {
    return 403 Forbidden
  }
}
```

---

## 📊 Audit Logging

### All Auth Events Logged

```javascript
{
  userId: "uuid",
  role: "OFFICER",
  departmentId: "dept-uuid",
  event: "LOGIN_SUCCESS",
  result: "SUCCESS",
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  timestamp: "2025-12-28T10:30:00Z",
  metadata: {
    jti: "token-uuid",
    sessionId: "session-uuid"
  }
}
```

### Events Tracked

- ✅ LOGIN_SUCCESS
- ✅ LOGIN_FAILED (with reason)
- ✅ LOGOUT
- ✅ TOKEN_EXPIRED
- ✅ TOKEN_REVOKED
- ✅ ACCOUNT_SUSPENDED
- ✅ ACCOUNT_ACTIVATED
- ✅ UNAUTHORIZED_ACCESS_ATTEMPT
- ✅ PASSWORD_CHANGED

---

## 🔒 Security Features

### Password Security
- **Hashing:** bcrypt (cost factor 12) or argon2
- **Requirements:**
  - Minimum 8 characters
  - Uppercase + lowercase
  - Digit + special character
- **Never stored in plain text**
- **Temporary passwords:** Auto-generated, 12 chars

### Token Security
- **JWT with short expiry:** 30 minutes
- **Unique JTI:** For revocation tracking
- **HTTPS only** in production
- **HttpOnly cookies** option available
- **SameSite=Strict**

### Rate Limiting
```javascript
{
  LOGIN_ATTEMPTS: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
    BLOCK_DURATION_MS: 30 * 60 * 1000  // 30 minutes
  }
}
```

### Email Domain Validation
```javascript
ALLOWED_EMAIL_DOMAINS = [
  'uk.gov.in',
  'gov.uk.in',
  'nic.in',
  'uttarakhand.gov.in'
]
```

---

## 📁 File Structure

```
src/
├── constants/
│   └── auth.js                    # Roles, permissions, config
├── models/
│   └── schemas.js                 # Data models (User, Department, etc.)
├── api/
│   └── authenticationAPI.js       # Frontend auth API client
├── middleware/
│   └── rbacMiddleware.js          # Backend RBAC middleware
├── routes/
│   ├── authRoutes.js             # Auth endpoints (login/logout/me)
│   ├── departmentRoutes.js       # Department registration endpoints
│   └── userRoutes.js             # User management endpoints
└── pages/
    ├── GovLogin.jsx              # Government-style login UI
    ├── GovLogin.css
    ├── DepartmentRegistration.jsx  # Dept registration form
    └── DepartmentRegistration.css
```

---

## 🚀 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/login` | Public | Authenticate user |
| POST | `/logout` | Auth Required | Logout and revoke token |
| GET | `/me` | Auth Required | Get current user profile |
| GET | `/verify` | Auth Required | Verify token validity |
| POST | `/refresh` | Auth Required | Refresh token |

### Department Routes (`/api/departments`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/registrations` | Public | Submit registration request |
| GET | `/registrations` | SUPER_ADMIN | List all requests |
| GET | `/registrations/:id` | SUPER_ADMIN | Get request details |
| POST | `/registrations/:id/approve` | SUPER_ADMIN | Approve request |
| POST | `/registrations/:id/reject` | SUPER_ADMIN | Reject request |

### User Management Routes (`/api/users`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | DEPT_ADMIN, SUPER_ADMIN | Create user |
| GET | `/` | DEPT_ADMIN, SUPER_ADMIN, AUDITOR | List users |
| GET | `/:userId` | DEPT_ADMIN, SUPER_ADMIN, AUDITOR | Get user details |
| PATCH | `/:userId/status` | DEPT_ADMIN, SUPER_ADMIN | Activate/suspend user |
| PATCH | `/:userId/role` | SUPER_ADMIN | Change user role |
| POST | `/:userId/reset-password` | DEPT_ADMIN, SUPER_ADMIN | Reset password |

---

## 🎨 UI Components

### Login Page (`GovLogin.jsx`)
- **Design:** Minimal, government-standard
- **Fields:** Email/Employee ID, Password
- **Features:** CAPTCHA placeholder, loading state
- **No:** Social auth, signup link
- **Links:** Department Registration

### Department Registration (`DepartmentRegistration.jsx`)
- **Access:** Public (no auth)
- **Purpose:** Request new department onboarding
- **Validation:** Official email domains only
- **Output:** PENDING request (not account)
- **Success:** Confirmation message with next steps

---

## 🔧 Environment Variables

```env
# Backend (.env)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=30m
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/govdb

# Frontend (.env)
REACT_APP_API_URL=https://api.ukgovplatform.in
REACT_APP_ENV=production
```

---

## ✅ Implementation Checklist

### Backend Setup
- [ ] Install dependencies: `express`, `jsonwebtoken`, `bcrypt`, `uuid`
- [ ] Set up database (PostgreSQL/MongoDB)
- [ ] Create User, Department, Session, AuthLog tables
- [ ] Implement auth routes (`authRoutes.js`)
- [ ] Implement RBAC middleware (`rbacMiddleware.js`)
- [ ] Implement department routes (`departmentRoutes.js`)
- [ ] Implement user management routes (`userRoutes.js`)
- [ ] Set up rate limiting (express-rate-limit)
- [ ] Configure CORS for frontend
- [ ] Add helmet for security headers
- [ ] Set up logging (Winston/Morgan)

### Database Seeding
- [ ] Create initial Super Admin account
- [ ] Script: `seeds/createSuperAdmin.js`
- [ ] Use strong password, store securely

### Frontend Setup
- [ ] Replace old login with `GovLogin.jsx`
- [ ] Add `DepartmentRegistration.jsx` route
- [ ] Update Redux actions for auth
- [ ] Add route guards (check role before render)
- [ ] Handle token expiration
- [ ] Add loading states
- [ ] Implement error handling

### Security Hardening
- [ ] Enable HTTPS only
- [ ] Set secure cookie options
- [ ] Add CAPTCHA integration (Google reCAPTCHA)
- [ ] Implement rate limiting on login
- [ ] Add IP-based blocking for repeated failures
- [ ] Set up monitoring alerts
- [ ] Regular security audits

### Testing
- [ ] Test login flow (all roles)
- [ ] Test department registration
- [ ] Test role-based access control
- [ ] Test cross-department access blocking
- [ ] Test token expiration handling
- [ ] Test password reset flow
- [ ] Test audit logging

### Deployment
- [ ] Set environment variables
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Set up monitoring (New Relic/DataDog)
- [ ] Document admin procedures

---

## 📝 Super Admin Creation Script

```javascript
// seeds/createSuperAdmin.js
const bcrypt = require('bcrypt');

async function createSuperAdmin() {
  const superAdmin = {
    email: 'superadmin@uk.gov.in',
    name: 'Super Administrator',
    role: 'SUPER_ADMIN',
    passwordHash: await bcrypt.hash('SecurePassword123!', 12),
    status: 'ACTIVE',
    departmentId: null,  // Super Admin has no department
    createdAt: new Date()
  };

  // Insert into database
  await db.users.insert(superAdmin);
  console.log('Super Admin created successfully');
}

createSuperAdmin();
```

---

## 🔄 User Journey Examples

### Journey 1: New Department Onboarding
```
1. Director of Agriculture wants access
2. Visits /department-registration
3. Fills form with official email
4. Request created (PENDING)
5. Super Admin reviews in dashboard
6. Super Admin approves
7. Department created + Admin account created
8. Director receives email with credentials
9. Director logs in, changes password
10. Director creates Officer accounts for staff
```

### Journey 2: Officer Daily Use
```
1. Officer logs in with email + password
2. System verifies credentials, checks status
3. Officer redirected to dashboard
4. Officer uploads document
5. Backend checks: Has canUploadDocuments permission?
6. Backend checks: Document.departmentId === Officer.departmentId?
7. Upload succeeds
8. Action logged in audit trail
```

### Journey 3: Auditor Read-Only Access
```
1. Auditor logs in
2. System identifies role = AUDITOR
3. Frontend hides upload/edit buttons
4. Auditor tries POST /documents/upload (via API test)
5. Backend enforceReadOnly middleware blocks request
6. Returns 403 Forbidden
7. Attempt logged as UNAUTHORIZED_ACCESS_ATTEMPT
```

---

## 📞 Support & Maintenance

### For End Users
- **Login Issues:** Contact Department Admin
- **Password Reset:** Contact Department Admin
- **Account Suspension:** Contact Department Admin or State IT Cell

### For Department Admins
- **New Department Registration:** Contact State IT Cell (Super Admin)
- **System Issues:** State IT Cell support portal
- **Feature Requests:** Submit via official channel

### For Super Admins
- **Technical Support:** NIC Uttarakhand / State IT Cell
- **Security Incidents:** Follow incident response protocol
- **System Monitoring:** Check logs daily

---

## 🎯 Success Criteria

✅ **Zero unauthorized access incidents**  
✅ **100% audit coverage** for auth events  
✅ **Sub-2-second login response time**  
✅ **Cross-department access blocked at backend**  
✅ **All accounts created via controlled process**  
✅ **Official email verification enforced**  
✅ **Token expiration handled gracefully**  
✅ **Role-based permissions enforced everywhere**

---

## 📚 Additional Resources

- **JWT Best Practices:** https://tools.ietf.org/html/rfc7519
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Government Security Guidelines:** [NIC Security Policy]
- **Database Design:** See `/models/schemas.js`

---

**Document Version:** 1.0  
**Last Updated:** December 28, 2025  
**Maintained By:** State IT Cell, Uttarakhand
