/**
 * User Management API Routes
 * Department Admin creates and manages users (Officers, Auditors)
 * 
 * DEPARTMENT_ADMIN: Create, suspend, activate users in own department
 * SUPER_ADMIN: Manage all users across departments
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { 
  requireAuth, 
  requireRole,
  requireDepartmentScope,
  requireSameDepartmentOrSuperAdmin
} = require('../middleware/rbacMiddleware');
const { 
  USER_ROLES, 
  USER_STATUS,
  ALLOWED_EMAIL_DOMAINS,
  VALIDATION_RULES
} = require('../constants/auth');

/**
 * POST /api/users
 * Create new user (OFFICER or AUDITOR) - Department Admin only
 * Department Admin can only create users in their own department
 */
router.post('/',
  requireAuth,
  requireRole(USER_ROLES.DEPARTMENT_ADMIN, USER_ROLES.SUPER_ADMIN),
  async (req, res) => {
    try {
      const {
        email,
        employeeId,
        name,
        role,
        designation,
        phoneNumber
      } = req.body;

      // Validation
      if (!email || !name || !role) {
        return res.status(400).json({
          success: false,
          code: 'MISSING_FIELDS',
          message: 'Email, name, and role are required.'
        });
      }

      // Department Admin can only create OFFICER or AUDITOR
      if (req.user.role === USER_ROLES.DEPARTMENT_ADMIN) {
        if (role !== USER_ROLES.OFFICER && role !== USER_ROLES.AUDITOR) {
          return res.status(403).json({
            success: false,
            code: 'INVALID_ROLE',
            message: 'Department Admin can only create Officer or Auditor roles.'
          });
        }
      }

      // Validate role
      if (!Object.values(USER_ROLES).includes(role)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_ROLE',
          message: 'Invalid role specified.'
        });
      }

      // Prevent creation of SUPER_ADMIN via API
      if (role === USER_ROLES.SUPER_ADMIN) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN',
          message: 'Super Admin accounts cannot be created via API.'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_EMAIL',
          message: 'Invalid email format.'
        });
      }

      // Validate email domain
      const emailDomain = email.split('@')[1].toLowerCase();
      const isValidDomain = ALLOWED_EMAIL_DOMAINS.some(domain => 
        emailDomain === domain || emailDomain.endsWith('.' + domain)
      );

      if (!isValidDomain) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_EMAIL_DOMAIN',
          message: `Email must be from an official government domain.`
        });
      }

      // Validate employee ID format if provided
      if (employeeId) {
        const { PATTERN } = VALIDATION_RULES.EMPLOYEE_ID;
        if (!PATTERN.test(employeeId)) {
          return res.status(400).json({
            success: false,
            code: 'INVALID_EMPLOYEE_ID',
            message: 'Invalid employee ID format.'
          });
        }
      }

      // Check if email already exists
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          code: 'EMAIL_EXISTS',
          message: 'A user with this email already exists.'
        });
      }

      // Check if employee ID already exists
      if (employeeId) {
        const existingEmployeeId = await findUserByEmployeeId(employeeId);
        if (existingEmployeeId) {
          return res.status(409).json({
            success: false,
            code: 'EMPLOYEE_ID_EXISTS',
            message: 'A user with this employee ID already exists.'
          });
        }
      }

      // Department assignment
      let departmentId;
      if (req.user.role === USER_ROLES.SUPER_ADMIN) {
        // Super Admin must specify department for non-admin users
        departmentId = req.body.departmentId;
        if (!departmentId && role !== USER_ROLES.DEPARTMENT_ADMIN) {
          return res.status(400).json({
            success: false,
            code: 'DEPARTMENT_REQUIRED',
            message: 'Department ID is required.'
          });
        }
      } else {
        // Department Admin creates users in their own department
        departmentId = req.user.departmentId;
      }

      // Verify department exists and is active
      if (departmentId) {
        const department = await getDepartmentById(departmentId);
        if (!department) {
          return res.status(404).json({
            success: false,
            code: 'DEPARTMENT_NOT_FOUND',
            message: 'Department not found.'
          });
        }
        if (department.status !== 'ACTIVE') {
          return res.status(400).json({
            success: false,
            code: 'DEPARTMENT_NOT_ACTIVE',
            message: 'Department is not active.'
          });
        }
      }

      // Generate temporary password
      const tempPassword = generateTemporaryPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      // Create user
      const newUser = await createUser({
        departmentId,
        email: email.toLowerCase(),
        employeeId: employeeId ? employeeId.toUpperCase() : null,
        name,
        role,
        passwordHash,
        status: USER_STATUS.ACTIVE,
        metadata: {
          designation,
          phoneNumber
        },
        createdBy: req.user.id
      });

      // TODO: Send email with credentials to user
      // sendWelcomeEmail(email, { email, tempPassword, role });

      res.status(201).json({
        success: true,
        message: 'User created successfully.',
        data: {
          id: newUser.id,
          email: newUser.email,
          employeeId: newUser.employeeId,
          name: newUser.name,
          role: newUser.role,
          status: newUser.status,
          departmentId: newUser.departmentId,
          // ONLY FOR DEVELOPMENT - communicate securely in production
          temporaryPassword: tempPassword
        }
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'Failed to create user.'
      });
    }
  }
);

/**
 * GET /api/users
 * List users - filtered by department for Department Admin
 */
router.get('/',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.DEPARTMENT_ADMIN, USER_ROLES.AUDITOR),
  async (req, res) => {
    try {
      const { role, status, page = 1, limit = 20 } = req.query;

      const filters = {};

      // Department Admin can only see users in their department
      if (req.user.role === USER_ROLES.DEPARTMENT_ADMIN || 
          req.user.role === USER_ROLES.AUDITOR) {
        filters.departmentId = req.user.departmentId;
      }

      // Super Admin can filter by department
      if (req.user.role === USER_ROLES.SUPER_ADMIN && req.query.departmentId) {
        filters.departmentId = req.query.departmentId;
      }

      if (role && Object.values(USER_ROLES).includes(role)) {
        filters.role = role;
      }

      if (status && Object.values(USER_STATUS).includes(status)) {
        filters.status = status;
      }

      const users = await listUsers(filters, page, limit);

      res.json({
        success: true,
        data: users.rows.map(user => ({
          id: user.id,
          email: user.email,
          employeeId: user.employeeId,
          name: user.name,
          role: user.role,
          status: user.status,
          departmentId: user.departmentId,
          department: user.department,
          metadata: user.metadata,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt
        })),
        pagination: {
          total: users.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(users.count / limit)
        }
      });

    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'Failed to fetch users.'
      });
    }
  }
);

/**
 * GET /api/users/:userId
 * Get single user details
 */
router.get('/:userId',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.DEPARTMENT_ADMIN, USER_ROLES.AUDITOR),
  requireSameDepartmentOrSuperAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          code: 'USER_NOT_FOUND',
          message: 'User not found.'
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          employeeId: user.employeeId,
          name: user.name,
          role: user.role,
          status: user.status,
          departmentId: user.departmentId,
          department: user.department,
          metadata: user.metadata,
          lastLoginAt: user.lastLoginAt,
          lastLoginIp: user.lastLoginIp,
          createdBy: user.createdBy,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'Failed to fetch user.'
      });
    }
  }
);

/**
 * PATCH /api/users/:userId/status
 * Activate or suspend user account
 */
router.patch('/:userId/status',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.DEPARTMENT_ADMIN),
  requireSameDepartmentOrSuperAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(USER_STATUS).includes(status)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_STATUS',
          message: 'Invalid status. Must be ACTIVE or SUSPENDED.'
        });
      }

      const user = await getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          code: 'USER_NOT_FOUND',
          message: 'User not found.'
        });
      }

      // Prevent modifying Super Admin accounts
      if (user.role === USER_ROLES.SUPER_ADMIN) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN',
          message: 'Super Admin accounts cannot be modified via this endpoint.'
        });
      }

      // Update status
      await updateUserStatus(userId, status);

      // Log the event
      const eventType = status === USER_STATUS.ACTIVE ? 
        'ACCOUNT_ACTIVATED' : 'ACCOUNT_SUSPENDED';
      
      await logAuthEvent({
        userId,
        role: user.role,
        departmentId: user.departmentId,
        event: eventType,
        result: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { 
          modifiedBy: req.user.id,
          previousStatus: user.status,
          newStatus: status
        }
      });

      // Revoke all active sessions if suspended
      if (status === USER_STATUS.SUSPENDED) {
        await revokeAllUserSessions(userId);
      }

      res.json({
        success: true,
        message: `User ${status.toLowerCase()} successfully.`,
        data: {
          userId,
          status
        }
      });

    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'Failed to update user status.'
      });
    }
  }
);

/**
 * PATCH /api/users/:userId/role
 * Change user role (Super Admin only)
 */
router.patch('/:userId/role',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!role || !Object.values(USER_ROLES).includes(role)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_ROLE',
          message: 'Invalid role specified.'
        });
      }

      const user = await getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          code: 'USER_NOT_FOUND',
          message: 'User not found.'
        });
      }

      // Update role
      await updateUserRole(userId, role);

      // Revoke all sessions to force re-login with new role
      await revokeAllUserSessions(userId);

      res.json({
        success: true,
        message: 'User role updated successfully. User must re-login.',
        data: {
          userId,
          newRole: role,
          previousRole: user.role
        }
      });

    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'Failed to update user role.'
      });
    }
  }
);

/**
 * POST /api/users/:userId/reset-password
 * Reset user password (generates new temporary password)
 */
router.post('/:userId/reset-password',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.DEPARTMENT_ADMIN),
  requireSameDepartmentOrSuperAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          code: 'USER_NOT_FOUND',
          message: 'User not found.'
        });
      }

      // Generate new temporary password
      const tempPassword = generateTemporaryPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      // Update password
      await updateUserPassword(userId, passwordHash);

      // Revoke all existing sessions
      await revokeAllUserSessions(userId);

      // TODO: Send email with new password
      // sendPasswordResetEmail(user.email, { tempPassword });

      res.json({
        success: true,
        message: 'Password reset successfully. New temporary password has been generated.',
        data: {
          userId,
          email: user.email,
          // ONLY FOR DEVELOPMENT - communicate securely in production
          temporaryPassword: tempPassword
        }
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'Failed to reset password.'
      });
    }
  }
);

// ============================================
// Helper Functions (Placeholders)
// ============================================

async function findUserByEmail(email) {
  // TODO: Database query
  return null;
}

async function findUserByEmployeeId(employeeId) {
  // TODO: Database query
  return null;
}

async function getDepartmentById(id) {
  // TODO: Database query
  return null;
}

async function createUser(data) {
  // TODO: Create user in database
  return { id: 'mock-user-id', ...data };
}

async function listUsers(filters, page, limit) {
  // TODO: Query with pagination and filters
  return { rows: [], count: 0 };
}

async function getUserById(userId) {
  // TODO: Database query with department join
  return null;
}

async function updateUserStatus(userId, status) {
  // TODO: Update user status in database
}

async function updateUserRole(userId, role) {
  // TODO: Update user role in database
}

async function updateUserPassword(userId, passwordHash) {
  // TODO: Update user password in database
}

async function revokeAllUserSessions(userId) {
  // TODO: Mark all user sessions as inactive
}

async function logAuthEvent(logData) {
  // TODO: Create auth log entry
  console.log('Auth Event:', logData);
}

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

module.exports = router;
