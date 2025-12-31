/**
 * RBAC Middleware - Backend
 * Role-Based Access Control & Authorization
 * 
 * CRITICAL: All authorization MUST be enforced on the backend.
 * Frontend UI gating is supplementary only.
 */

const jwt = require('jsonwebtoken');
const { USER_ROLES, ROLE_PERMISSIONS, USER_STATUS, AUTH_EVENTS } = require('../constants/auth');

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * REQUIRE AUTHENTICATION
 * Verifies JWT token and attaches user to request
 */
const requireAuth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: 'NO_TOKEN',
        message: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if token is revoked (check against denylist/session table)
    const isRevoked = await checkTokenRevoked(decoded.jti);
    if (isRevoked) {
      await logAuthEvent({
        userId: decoded.sub,
        event: AUTH_EVENTS.TOKEN_REVOKED,
        result: 'FAIL',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        failureReason: 'Token has been revoked'
      });

      return res.status(401).json({
        success: false,
        code: 'TOKEN_REVOKED',
        message: 'Token has been revoked. Please login again.'
      });
    }

    // Fetch user from database (to ensure account is still active)
    const user = await getUserById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found.'
      });
    }

    // Check if user account is active
    if (user.status !== USER_STATUS.ACTIVE) {
      await logAuthEvent({
        userId: user.id,
        event: AUTH_EVENTS.UNAUTHORIZED_ACCESS_ATTEMPT,
        result: 'FAIL',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        failureReason: `Account status: ${user.status}`
      });

      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_NOT_ACTIVE',
        message: `Account is ${user.status.toLowerCase()}. Please contact administrator.`
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      employeeId: user.employeeId,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
      jti: decoded.jti
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired. Please login again.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Invalid token. Please login again.'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      code: 'AUTH_ERROR',
      message: 'Authentication error occurred.'
    });
  }
};

/**
 * REQUIRE ROLE
 * Checks if user has one of the required roles
 * Usage: requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.DEPARTMENT_ADMIN)
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Log unauthorized access attempt
      logAuthEvent({
        userId: req.user.id,
        role: req.user.role,
        departmentId: req.user.departmentId,
        event: AUTH_EVENTS.UNAUTHORIZED_ACCESS_ATTEMPT,
        result: 'FAIL',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        failureReason: `Insufficient role. Required: ${allowedRoles.join(', ')}, Has: ${req.user.role}`
      });

      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions. You do not have access to this resource.'
      });
    }

    next();
  };
};

/**
 * REQUIRE PERMISSION
 * Checks if user's role has a specific permission
 * Usage: requirePermission('canUploadDocuments')
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    const rolePermissions = ROLE_PERMISSIONS[req.user.role];

    if (!rolePermissions || !rolePermissions[permission]) {
      logAuthEvent({
        userId: req.user.id,
        role: req.user.role,
        departmentId: req.user.departmentId,
        event: AUTH_EVENTS.UNAUTHORIZED_ACCESS_ATTEMPT,
        result: 'FAIL',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        failureReason: `Missing permission: ${permission}`
      });

      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions for this action.'
      });
    }

    next();
  };
};

/**
 * REQUIRE DEPARTMENT SCOPE
 * Ensures user can only access resources within their department
 * Exceptions: SUPER_ADMIN can access all departments
 */
const requireDepartmentScope = (deptIdParam = 'departmentId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    // SUPER_ADMIN can access all departments
    if (req.user.role === USER_ROLES.SUPER_ADMIN) {
      return next();
    }

    // Get department ID from request (params, body, or query)
    const requestedDeptId = req.params[deptIdParam] || 
                           req.body[deptIdParam] || 
                           req.query[deptIdParam];

    if (!requestedDeptId) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_DEPARTMENT_ID',
        message: 'Department ID is required.'
      });
    }

    // Check if user's department matches requested department
    if (req.user.departmentId !== requestedDeptId) {
      logAuthEvent({
        userId: req.user.id,
        role: req.user.role,
        departmentId: req.user.departmentId,
        event: AUTH_EVENTS.UNAUTHORIZED_ACCESS_ATTEMPT,
        result: 'FAIL',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        failureReason: `Cross-department access attempt. User dept: ${req.user.departmentId}, Requested: ${requestedDeptId}`
      });

      return res.status(403).json({
        success: false,
        code: 'CROSS_DEPARTMENT_ACCESS_DENIED',
        message: 'You can only access resources within your department.'
      });
    }

    next();
  };
};

/**
 * ENFORCE READ ONLY
 * Blocks write operations for read-only roles (e.g., AUDITOR)
 */
const enforceReadOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Authentication required.'
    });
  }

  const rolePermissions = ROLE_PERMISSIONS[req.user.role];

  if (rolePermissions && rolePermissions.readOnly) {
    const writeOperations = ['POST', 'PUT', 'PATCH', 'DELETE'];
    
    if (writeOperations.includes(req.method)) {
      logAuthEvent({
        userId: req.user.id,
        role: req.user.role,
        departmentId: req.user.departmentId,
        event: AUTH_EVENTS.UNAUTHORIZED_ACCESS_ATTEMPT,
        result: 'FAIL',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        failureReason: `Read-only role attempted ${req.method} operation`
      });

      return res.status(403).json({
        success: false,
        code: 'READ_ONLY_ROLE',
        message: 'Your role has read-only access. Write operations are not permitted.'
      });
    }
  }

  next();
};

/**
 * REQUIRE SAME DEPARTMENT OR SUPER ADMIN
 * For endpoints that require department admin to manage users in their department
 */
const requireSameDepartmentOrSuperAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Authentication required.'
    });
  }

  // SUPER_ADMIN can access all
  if (req.user.role === USER_ROLES.SUPER_ADMIN) {
    return next();
  }

  // Get target user ID from params
  const targetUserId = req.params.userId;

  if (!targetUserId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required.'
    });
  }

  // Fetch target user to check department
  const targetUser = await getUserById(targetUserId);

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found.'
    });
  }

  // Check if same department
  if (req.user.departmentId !== targetUser.departmentId) {
    return res.status(403).json({
      success: false,
      code: 'CROSS_DEPARTMENT_ACCESS_DENIED',
      message: 'You can only manage users within your department.'
    });
  }

  next();
};

// ============================================
// Helper Functions (to be implemented in actual backend)
// ============================================

/**
 * Check if JWT token is revoked
 * (Check against Session table or Redis denylist)
 */
async function checkTokenRevoked(jti) {
  // TODO: Implement actual check against database/redis
  // Example:
  // const session = await Session.findOne({ jti, isActive: false });
  // return !!session;
  return false; // Placeholder
}

/**
 * Get user by ID from database
 */
async function getUserById(userId) {
  // TODO: Implement actual database query
  // Example:
  // return await User.findById(userId);
  return null; // Placeholder - replace with actual DB call
}

/**
 * Log authentication event
 */
async function logAuthEvent(logData) {
  try {
    // TODO: Implement actual logging to database
    // Example:
    // await AuthLog.create(logData);
    console.log('Auth Event:', logData);
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
}

module.exports = {
  requireAuth,
  requireRole,
  requirePermission,
  requireDepartmentScope,
  enforceReadOnly,
  requireSameDepartmentOrSuperAdmin
};
