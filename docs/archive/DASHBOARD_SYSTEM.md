# Role-Based Dashboard System

Government Document Management & Routing System for Uttarakhand Government

## Overview

This system implements **4 role-based dashboards** with strict access control for internal government document management.

## Roles & Access

### 1. SUPER_ADMIN
**Route:** `/admin/dashboard`

**Purpose:** State-level oversight and governance

**Features:**
- System-wide metrics (departments, users, documents)
- Department registration approval/rejection
- System activity logs
- No direct document handling

**Navigation:**
- Dashboard
- Department Registrations
- Departments
- System Logs
- Settings

### 2. DEPARTMENT_ADMIN  
**Route:** `/department/dashboard`

**Purpose:** Department-level control and coordination

**Features:**
- Department metrics (received, action required, overdue)
- Document overview with routing
- User management (officers, auditors)
- Audit logs for department

**Navigation:**
- Dashboard
- Documents
- Routing Rules
- Users
- Audit Logs

### 3. OFFICER
**Route:** `/dashboard`

**Purpose:** Daily operational work

**Features:**
- Action-required documents (priority)
- Documents for information
- Document upload
- Quick actions (upload, search, reports)

**Navigation:**
- Dashboard
- My Documents
- Upload Document
- Notifications

### 4. AUDITOR (Read-Only)
**Route:** `/audit/search`

**Purpose:** Compliance and audit support

**Features:**
- Advanced document search (department, category, date)
- Audit logs with timestamps
- Document timeline view
- **No upload/edit/approve permissions**

**Navigation:**
- Search Documents
- Audit Logs

## Design Principles

✅ **Government-Standard UI**
- Clean, serious, professional design
- Minimal animations
- Information-first layout

✅ **Colors**
- Primary: Deep Green `#0f5e59`
- Background: White `#ffffff`, Light Gray `#f5f5f5`
- Accent: Status-based colors

✅ **Components**
- Metric Cards (dashboard statistics)
- Status Badges (pending, approved, etc.)
- Document Cards (with AI summaries)
- Data Tables (with filters and actions)
- Sidebar Navigation (role-based)

## Access Control

**Frontend Protection:**
- `ProtectedRoute` component wraps all dashboard routes
- Checks authentication token
- Validates user role against allowed roles
- Redirects to login if unauthorized

**Backend Enforcement Required:**
- All API endpoints must validate JWT tokens
- Check user role before allowing operations
- Log all actions for audit trail

## File Structure

```
src/
├── components/
│   ├── ProtectedRoute.jsx           # Role-based route guard
│   ├── dashboardSidebar/
│   │   ├── Sidebar.jsx              # Adaptive navigation
│   │   └── Sidebar.css
│   └── dashboardShared/
│       ├── SharedComponents.jsx     # Reusable UI components
│       └── SharedComponents.css
├── pages/
│   └── dashboards/
│       ├── SuperAdminDashboard.jsx
│       ├── SuperAdminDashboard.css
│       ├── DepartmentAdminDashboard.jsx
│       ├── OfficerDashboard.jsx
│       ├── OfficerDashboard.css
│       ├── AuditorDashboard.jsx
│       └── AuditorDashboard.css
└── App.js                           # Route definitions
```

## Routes Configuration

```javascript
// Super Admin
<Route path="/admin/dashboard" element={
  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
    <SuperAdminDashboard />
  </ProtectedRoute>
} />

// Department Admin
<Route path="/department/dashboard" element={
  <ProtectedRoute allowedRoles={['DEPARTMENT_ADMIN']}>
    <DepartmentAdminDashboard />
  </ProtectedRoute>
} />

// Officer
<Route path="/dashboard" element={
  <ProtectedRoute allowedRoles={['OFFICER']}>
    <OfficerDashboard />
  </ProtectedRoute>
} />

// Auditor
<Route path="/audit/search" element={
  <ProtectedRoute allowedRoles={['AUDITOR']}>
    <AuditorDashboard />
  </ProtectedRoute>
} />
```

## Mock Data

All dashboards currently use **mock data** for demonstration. Replace with actual API calls:

```javascript
// Example: Fetching documents
const [documents, setDocuments] = useState([]);

useEffect(() => {
  const fetchDocuments = async () => {
    const response = await getDocuments();
    setDocuments(response.data);
  };
  fetchDocuments();
}, []);
```

## Next Steps

1. **Backend Integration:**
   - Connect to actual document management API
   - Implement JWT validation on all endpoints
   - Add audit logging middleware

2. **Additional Pages:**
   - Document detail view
   - User management interface
   - Routing rules configuration
   - System settings

3. **Features:**
   - Real-time notifications
   - Document upload with validation
   - PDF preview
   - Advanced search filters
   - Export reports (Excel, PDF)

4. **Security:**
   - Rate limiting
   - Session timeout
   - IP whitelisting
   - Two-factor authentication

## Testing

**Test Login Flow:**
1. Login with different roles
2. Verify correct dashboard redirect
3. Check sidebar navigation matches role
4. Attempt to access unauthorized routes
5. Verify access denied message

**Test Mock User Credentials:**
```
Super Admin:
- Email: superadmin@uk.gov.in
- Role: SUPER_ADMIN

Department Admin:
- Email: deptadmin@agriculture.uk.gov.in  
- Role: DEPARTMENT_ADMIN

Officer:
- Email: officer@agriculture.uk.gov.in
- Role: OFFICER

Auditor:
- Email: auditor@uk.gov.in
- Role: AUDITOR
```

## Support

For issues or questions, contact the State IT Cell or refer to the main project documentation.

---

**Built for:** Uttarakhand Government Internal Platform  
**Last Updated:** December 2025
