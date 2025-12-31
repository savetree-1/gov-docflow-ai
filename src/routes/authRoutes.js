/**
 * Backend Authentication Routes
 * Implements login, logout, and user verification endpoints
 * 
 * REQUIRES:
 * - bcrypt or argon2 for password hashing
 * - jsonwebtoken for JWT generation
 * - Database models (User, Session, AuthLog)
 * - Rate limiting middleware
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // or use argon2
const { v4: uuidv4 } = require('uuid');

const { requireAuth } = require('../middleware/rbacMiddleware');
const { 
  USER_STATUS, 
  AUTH_EVENTS, 
  JWT_CONFIG,
  ALLOWED_EMAIL_DOMAINS 
} = require('../constants/auth');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '30m';

/**
 * POST /api/auth/login
 * Authenticate user and issue JWT token
 */
router.post('/login', async (req, res) => {
  const { emailOrEmployeeId, password, captchaToken } = req.body;

  try {
    // Input validation
    if (!emailOrEmployeeId || !password) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_CREDENTIALS',
        message: 'Email/Employee ID and password are required.'
      });
    }

    // TODO: Verify CAPTCHA if provided
    // if (captchaToken) {
    //   const captchaValid = await verifyCaptcha(captchaToken);
    //   if (!captchaValid) {
    //     return res.status(400).json({
    //       success: false,
    //       code: 'INVALID_CAPTCHA',
    //       message: 'Invalid CAPTCHA. Please try again.'
    //     });
    //   }
    // }

    // Check rate limiting
    const rateLimitExceeded = await checkRateLimit(emailOrEmployeeId, req.ip);
    if (rateLimitExceeded) {
      await logAuthEvent({
        emailOrEmployeeId,
        event: AUTH_EVENTS.LOGIN_FAILED,
        result: 'FAIL',
        failureReason: 'Rate limit exceeded',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts. Please try again after 30 minutes.'
      });
    }

    // Find user by email or employee ID
    const user = await findUserByEmailOrEmployeeId(emailOrEmployeeId);

    if (!user) {
      await logAuthEvent({
        emailOrEmployeeId,
        event: AUTH_EVENTS.LOGIN_FAILED,
        result: 'FAIL',
        failureReason: 'User not found',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      await incrementRateLimit(emailOrEmployeeId, req.ip);

      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email/employee ID or password.'
      });
    }

    // Check account status
    if (user.status !== USER_STATUS.ACTIVE) {
      await logAuthEvent({
        userId: user.id,
        emailOrEmployeeId,
        role: user.role,
        departmentId: user.departmentId,
        event: AUTH_EVENTS.LOGIN_FAILED,
        result: 'FAIL',
        failureReason: `Account status: ${user.status}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_NOT_ACTIVE',
        message: `Account is ${user.status.toLowerCase()}. Please contact administrator.`
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      await logAuthEvent({
        userId: user.id,
        emailOrEmployeeId,
        role: user.role,
        departmentId: user.departmentId,
        event: AUTH_EVENTS.LOGIN_FAILED,
        result: 'FAIL',
        failureReason: 'Invalid password',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      await incrementRateLimit(emailOrEmployeeId, req.ip);

      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email/employee ID or password.'
      });
    }

    // Generate JWT token
    const jti = uuidv4(); // Unique token ID for revocation
    const tokenPayload = {
      sub: user.id,
      role: user.role,
      departmentId: user.departmentId,
      jti,
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      issuer: JWT_CONFIG.ISSUER
    });

    // Calculate expiry time in seconds
    const expiresIn = parseExpiry(JWT_EXPIRY);

    // Create session record
    await createSession({
      jti,
      userId: user.id,
      role: user.role,
      departmentId: user.departmentId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      expiresAt: new Date(Date.now() + expiresIn * 1000)
    });

    // Update user's last login
    await updateUserLastLogin(user.id, req.ip);

    // Log successful login
    await logAuthEvent({
      userId: user.id,
      emailOrEmployeeId,
      role: user.role,
      departmentId: user.departmentId,
      event: AUTH_EVENTS.LOGIN_SUCCESS,
      result: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { jti }
    });

    // Clear rate limit for this identifier
    await clearRateLimit(emailOrEmployeeId, req.ip);

    // Return user info (without sensitive data)
    const userResponse = {
      id: user.id,
      email: user.email,
      employeeId: user.employeeId,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
      department: user.department ? {
        id: user.department.id,
        name: user.department.name,
        level: user.department.level
      } : null,
      metadata: user.metadata
    };

    res.json({
      success: true,
      token,
      user: userResponse,
      expiresIn
    });

  } catch (error) {
    console.error('Login error:', error);
    
    await logAuthEvent({
      emailOrEmployeeId,
      event: AUTH_EVENTS.LOGIN_FAILED,
      result: 'FAIL',
      failureReason: 'Server error',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Login failed due to server error.'
    });
  }
});

/**
 * POST /api/auth/logout
 * Revoke current session and logout user
 */
router.post('/logout', requireAuth, async (req, res) => {
  try {
    const { jti, id: userId, role, departmentId } = req.user;

    // Revoke session
    await revokeSession(jti);

    // Log logout
    await logAuthEvent({
      userId,
      role,
      departmentId,
      event: AUTH_EVENTS.LOGOUT,
      result: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { jti }
    });

    res.json({
      success: true,
      message: 'Logged out successfully.'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      code: 'LOGOUT_ERROR',
      message: 'Logout failed.'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch fresh user data from database
    const user = await getUserWithDepartment(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found.'
      });
    }

    // Check if account is still active
    if (user.status !== USER_STATUS.ACTIVE) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_NOT_ACTIVE',
        message: `Account is ${user.status.toLowerCase()}.`
      });
    }

    // Return user info
    const userResponse = {
      id: user.id,
      email: user.email,
      employeeId: user.employeeId,
      name: user.name,
      role: user.role,
      status: user.status,
      departmentId: user.departmentId,
      department: user.department ? {
        id: user.department.id,
        name: user.department.name,
        code: user.department.code,
        level: user.department.level
      } : null,
      metadata: user.metadata,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Failed to fetch user profile.'
    });
  }
});

/**
 * GET /api/auth/verify
 * Verify if current token is valid
 */
router.get('/verify', requireAuth, (req, res) => {
  // If middleware passed, token is valid
  res.json({
    success: true,
    valid: true,
    user: {
      id: req.user.id,
      role: req.user.role,
      departmentId: req.user.departmentId
    }
  });
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token (optional - for future enhancement)
 */
router.post('/refresh', requireAuth, async (req, res) => {
  try {
    const { id: userId, role, departmentId, jti: oldJti } = req.user;

    // Revoke old token
    await revokeSession(oldJti);

    // Generate new token
    const jti = uuidv4();
    const tokenPayload = {
      sub: userId,
      role,
      departmentId,
      jti,
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      issuer: JWT_CONFIG.ISSUER
    });

    const expiresIn = parseExpiry(JWT_EXPIRY);

    // Create new session
    await createSession({
      jti,
      userId,
      role,
      departmentId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      expiresAt: new Date(Date.now() + expiresIn * 1000)
    });

    res.json({
      success: true,
      token,
      expiresIn
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      code: 'REFRESH_ERROR',
      message: 'Failed to refresh token.'
    });
  }
});

// ============================================
// Helper Functions (Placeholders - implement with actual DB)
// ============================================

async function findUserByEmailOrEmployeeId(identifier) {
  // TODO: Implement actual database query
  // Example with Sequelize:
  // return await User.findOne({
  //   where: {
  //     [Op.or]: [
  //       { email: identifier.toLowerCase() },
  //       { employeeId: identifier.toUpperCase() }
  //     ]
  //   },
  //   include: [{ model: Department, as: 'department' }]
  // });
  return null; // Placeholder
}

async function getUserWithDepartment(userId) {
  // TODO: Implement actual database query with department join
  return null; // Placeholder
}

async function updateUserLastLogin(userId, ipAddress) {
  // TODO: Update user's lastLoginAt and lastLoginIp
  // Example:
  // await User.update(
  //   { lastLoginAt: new Date(), lastLoginIp: ipAddress },
  //   { where: { id: userId } }
  // );
}

async function createSession(sessionData) {
  // TODO: Create session record in database
  // Example:
  // await Session.create({
  //   ...sessionData,
  //   isActive: true,
  //   issuedAt: new Date()
  // });
}

async function revokeSession(jti) {
  // TODO: Mark session as inactive/revoked
  // Example:
  // await Session.update(
  //   { isActive: false, revokedAt: new Date() },
  //   { where: { jti } }
  // );
}

async function checkRateLimit(identifier, ipAddress) {
  // TODO: Check rate limit from database or Redis
  // Return true if rate limit exceeded
  return false; // Placeholder
}

async function incrementRateLimit(identifier, ipAddress) {
  // TODO: Increment failed login attempts
}

async function clearRateLimit(identifier, ipAddress) {
  // TODO: Clear rate limit counter on successful login
}

async function logAuthEvent(logData) {
  // TODO: Create auth log entry
  // Example:
  // await AuthLog.create({
  //   ...logData,
  //   timestamp: new Date()
  // });
  console.log('Auth Event:', logData);
}

function parseExpiry(expiryString) {
  // Parse expiry string like '30m', '1h', '7d' to seconds
  const match = expiryString.match(/^(\d+)([smhd])$/);
  if (!match) return 1800; // Default 30 minutes

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * (multipliers[unit] || 60);
}

module.exports = router;
