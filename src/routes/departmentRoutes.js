/**
 * Department Registration API Routes
 * Backend endpoints for department onboarding workflow
 * 
 * PUBLIC: Submit registration request
 * SUPER_ADMIN: List, approve, reject requests
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { 
  requireAuth, 
  requireRole 
} = require('../middleware/rbacMiddleware');
const { 
  USER_ROLES, 
  DEPARTMENT_STATUS, 
  REGISTRATION_STATUS,
  USER_STATUS,
  ALLOWED_EMAIL_DOMAINS,
  DEPARTMENT_LEVELS
} = require('../constants/auth');

/**
 * POST /api/departments/registrations
 * Submit department registration request (PUBLIC - no auth required)
 * This is NOT a user signup - it's a request for department onboarding
 */
router.post('/registrations', async (req, res) => {
  try {
    const {
      departmentName,
      level,
      districtName,
      nodalOfficerName,
      nodalOfficerEmail,
      nodalOfficerPhone,
      nodalOfficerDesignation,
      officeAddress,
      officePhone
    } = req.body;

    // Validation
    if (!departmentName || !level || !nodalOfficerName || !nodalOfficerEmail || !officeAddress) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Department name, level, nodal officer details, and office address are required.'
      });
    }

    // Validate department level
    if (!Object.values(DEPARTMENT_LEVELS).includes(level)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_LEVEL',
        message: 'Invalid department level. Must be STATE or DISTRICT.'
      });
    }

    // If DISTRICT level, district name is required
    if (level === DEPARTMENT_LEVELS.DISTRICT && !districtName) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_DISTRICT_NAME',
        message: 'District name is required for district-level departments.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(nodalOfficerEmail)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_EMAIL',
        message: 'Invalid email format.'
      });
    }

    // Validate email domain (must be official government email)
    const emailDomain = nodalOfficerEmail.split('@')[1].toLowerCase();
    const isValidDomain = ALLOWED_EMAIL_DOMAINS.some(domain => 
      emailDomain === domain || emailDomain.endsWith('.' + domain)
    );

    if (!isValidDomain) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_EMAIL_DOMAIN',
        message: `Email must be from an official government domain (${ALLOWED_EMAIL_DOMAINS.join(', ')}).`
      });
    }

    // Check if department already exists
    const existingDepartment = await findDepartmentByName(departmentName);
    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        code: 'DEPARTMENT_EXISTS',
        message: 'A department with this name already exists.'
      });
    }

    // Check if email already registered
    const existingUser = await findUserByEmail(nodalOfficerEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        code: 'EMAIL_ALREADY_REGISTERED',
        message: 'This email is already registered in the system.'
      });
    }

    // Check for pending request with same email
    const pendingRequest = await findPendingRequestByEmail(nodalOfficerEmail);
    if (pendingRequest) {
      return res.status(409).json({
        success: false,
        code: 'REQUEST_ALREADY_PENDING',
        message: 'A registration request with this email is already pending approval.'
      });
    }

    // Generate department code
    const departmentCode = generateDepartmentCode(departmentName, level);

    // Create registration request
    const registration = await createDepartmentRegistration({
      departmentName,
      departmentCode,
      level,
      districtName: level === DEPARTMENT_LEVELS.DISTRICT ? districtName : null,
      nodalOfficerName,
      nodalOfficerEmail: nodalOfficerEmail.toLowerCase(),
      nodalOfficerPhone,
      nodalOfficerDesignation,
      officeAddress,
      officePhone,
      status: REGISTRATION_STATUS.PENDING,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // TODO: Send notification to Super Admins

    res.status(201).json({
      success: true,
      message: 'Department registration request submitted successfully. You will be notified once approved.',
      registrationId: registration.id
    });

  } catch (error) {
    console.error('Department registration error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Failed to submit registration request.'
    });
  }
});

/**
 * GET /api/departments/registrations
 * List all department registration requests (SUPER_ADMIN only)
 */
router.get('/registrations', 
  requireAuth, 
  requireRole(USER_ROLES.SUPER_ADMIN), 
  async (req, res) => {
    try {
      const { status, page = 1, limit = 20 } = req.query;

      const filters = {};
      if (status && Object.values(REGISTRATION_STATUS).includes(status)) {
        filters.status = status;
      }

      const registrations = await listDepartmentRegistrations(filters, page, limit);

      res.json({
        success: true,
        data: registrations.rows,
        pagination: {
          total: registrations.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(registrations.count / limit)
        }
      });

    } catch (error) {
      console.error('List registrations error:', error);
      res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'Failed to fetch registration requests.'
      });
    }
  }
);

/**
 * GET /api/departments/registrations/:id
 * Get single registration request details (SUPER_ADMIN only)
 */
router.get('/registrations/:id',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN),
  async (req, res) => {
    try {
      const { id } = req.params;

      const registration = await getRegistrationById(id);

      if (!registration) {
        return res.status(404).json({
          success: false,
          code: 'NOT_FOUND',
          message: 'Registration request not found.'
        });
      }

      res.json({
        success: true,
        data: registration
      });

    } catch (error) {
      console.error('Get registration error:', error);
      res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'Failed to fetch registration request.'
      });
    }
  }
);

/**
 * POST /api/departments/registrations/:id/approve
 * Approve department registration and create department + admin user (SUPER_ADMIN only)
 */
router.post('/registrations/:id/approve',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const registration = await getRegistrationById(id);

      if (!registration) {
        return res.status(404).json({
          success: false,
          code: 'NOT_FOUND',
          message: 'Registration request not found.'
        });
      }

      if (registration.status !== REGISTRATION_STATUS.PENDING) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_STATUS',
          message: `Registration is already ${registration.status.toLowerCase()}.`
        });
      }

      // Start transaction (pseudo-code - use actual DB transaction)
      // const transaction = await startTransaction();

      try {
        // 1. Create Department
        const department = await createDepartment({
          name: registration.departmentName,
          code: registration.departmentCode,
          level: registration.level,
          status: DEPARTMENT_STATUS.ACTIVE,
          metadata: {
            address: registration.officeAddress,
            contactEmail: registration.nodalOfficerEmail,
            contactPhone: registration.officePhone || registration.nodalOfficerPhone,
            districtName: registration.districtName
          },
          createdBy: req.user.id
        });

        // 2. Generate temporary password for Department Admin
        const tempPassword = generateTemporaryPassword();
        const passwordHash = await bcrypt.hash(tempPassword, 12);

        // 3. Create Department Admin user
        const adminUser = await createUser({
          departmentId: department.id,
          email: registration.nodalOfficerEmail.toLowerCase(),
          name: registration.nodalOfficerName,
          role: USER_ROLES.DEPARTMENT_ADMIN,
          passwordHash,
          status: USER_STATUS.ACTIVE,
          metadata: {
            designation: registration.nodalOfficerDesignation,
            phoneNumber: registration.nodalOfficerPhone
          },
          createdBy: req.user.id
        });

        // 4. Update registration request
        await updateRegistration(id, {
          status: REGISTRATION_STATUS.APPROVED,
          decidedBy: req.user.id,
          decidedAt: new Date(),
          decisionNotes: notes || null,
          createdDepartmentId: department.id,
          createdAdminUserId: adminUser.id
        });

        // Commit transaction
        // await commitTransaction(transaction);

        // TODO: Send email to nodal officer with credentials
        // sendCredentialsEmail(registration.nodalOfficerEmail, {
        //   email: registration.nodalOfficerEmail,
        //   tempPassword,
        //   departmentName: department.name
        // });

        res.json({
          success: true,
          message: 'Department registration approved successfully.',
          data: {
            department: {
              id: department.id,
              name: department.name,
              code: department.code
            },
            adminUser: {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name
            },
            // In production, DO NOT send password in response
            // Communicate securely via email/SMS
            temporaryPassword: tempPassword // ONLY FOR DEVELOPMENT
          }
        });

      } catch (innerError) {
        // Rollback transaction
        // await rollbackTransaction(transaction);
        throw innerError;
      }

    } catch (error) {
      console.error('Approve registration error:', error);
      res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'Failed to approve registration request.'
      });
    }
  }
);

/**
 * POST /api/departments/registrations/:id/reject
 * Reject department registration request (SUPER_ADMIN only)
 */
router.post('/registrations/:id/reject',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      if (!notes) {
        return res.status(400).json({
          success: false,
          code: 'MISSING_NOTES',
          message: 'Rejection reason is required.'
        });
      }

      const registration = await getRegistrationById(id);

      if (!registration) {
        return res.status(404).json({
          success: false,
          code: 'NOT_FOUND',
          message: 'Registration request not found.'
        });
      }

      if (registration.status !== REGISTRATION_STATUS.PENDING) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_STATUS',
          message: `Registration is already ${registration.status.toLowerCase()}.`
        });
      }

      // Update registration status
      await updateRegistration(id, {
        status: REGISTRATION_STATUS.REJECTED,
        decidedBy: req.user.id,
        decidedAt: new Date(),
        decisionNotes: notes
      });

      // TODO: Send notification email to applicant

      res.json({
        success: true,
        message: 'Department registration rejected.'
      });

    } catch (error) {
      console.error('Reject registration error:', error);
      res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: 'Failed to reject registration request.'
      });
    }
  }
);

// ============================================
// Helper Functions (Placeholders)
// ============================================

async function findDepartmentByName(name) {
  // TODO: Database query
  return null;
}

async function findUserByEmail(email) {
  // TODO: Database query
  return null;
}

async function findPendingRequestByEmail(email) {
  // TODO: Database query
  return null;
}

function generateDepartmentCode(name, level) {
  // Generate unique department code
  // Example: "UK" + first 4 letters of name + random digits
  const prefix = level === DEPARTMENT_LEVELS.STATE ? 'UK' : 'UKD';
  const nameCode = name.replace(/[^A-Z]/gi, '').substring(0, 4).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${nameCode}${random}`;
}

async function createDepartmentRegistration(data) {
  // TODO: Create registration in database
  return { id: 'mock-id', ...data };
}

async function listDepartmentRegistrations(filters, page, limit) {
  // TODO: Query with pagination
  return { rows: [], count: 0 };
}

async function getRegistrationById(id) {
  // TODO: Database query
  return null;
}

async function createDepartment(data) {
  // TODO: Create department in database
  return { id: 'mock-dept-id', ...data };
}

async function createUser(data) {
  // TODO: Create user in database
  return { id: 'mock-user-id', ...data };
}

async function updateRegistration(id, data) {
  // TODO: Update registration in database
}

function generateTemporaryPassword() {
  // Generate secure temporary password
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

module.exports = router;
