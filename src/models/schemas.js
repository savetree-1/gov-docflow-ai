/**
 * Data Models & Schemas
 * Government Internal Platform
 * 
 * These represent the expected backend database structure
 * For MongoDB/Mongoose or PostgreSQL/Sequelize
 */

/**
 * USER MODEL
 * Represents all authenticated users in the system
 */
export const UserSchema = {
  id: 'UUID or ObjectId',
  departmentId: 'UUID or ObjectId | null',  // null for SUPER_ADMIN
  email: 'string (unique, lowercase)',
  employeeId: 'string (unique, optional)',
  name: 'string',
  role: 'enum[SUPER_ADMIN, DEPARTMENT_ADMIN, OFFICER, AUDITOR]',
  passwordHash: 'string (bcrypt/argon2)',
  status: 'enum[ACTIVE, SUSPENDED, PENDING]',
  lastLoginAt: 'datetime | null',
  lastLoginIp: 'string | null',
  createdBy: 'UUID or ObjectId | null',  // References User.id
  createdAt: 'datetime',
  updatedAt: 'datetime',
  metadata: {
    designation: 'string (optional)',
    phoneNumber: 'string (optional)',
    officeLocation: 'string (optional)'
  }
};

/**
 * DEPARTMENT MODEL
 * Represents government departments/divisions
 */
export const DepartmentSchema = {
  id: 'UUID or ObjectId',
  name: 'string (unique)',
  code: 'string (unique, e.g., UKAGRI, UKHEALTH)',
  level: 'enum[STATE, DISTRICT]',
  status: 'enum[ACTIVE, PENDING, REJECTED, SUSPENDED]',
  parentDepartmentId: 'UUID or ObjectId | null',  // For hierarchical structure
  metadata: {
    address: 'string',
    contactEmail: 'string',
    contactPhone: 'string',
    districtName: 'string (if DISTRICT level)'
  },
  createdBy: 'UUID or ObjectId',  // References User.id (SUPER_ADMIN)
  createdAt: 'datetime',
  updatedAt: 'datetime'
};

/**
 * DEPARTMENT REGISTRATION REQUEST MODEL
 * Used for new department onboarding (not user signup)
 */
export const DepartmentRegistrationRequestSchema = {
  id: 'UUID or ObjectId',
  departmentName: 'string',
  departmentCode: 'string (optional, auto-generated)',
  level: 'enum[STATE, DISTRICT]',
  districtName: 'string | null',  // Required if level = DISTRICT
  
  // Nodal Officer Information
  nodalOfficerName: 'string',
  nodalOfficerEmail: 'string',
  nodalOfficerPhone: 'string',
  nodalOfficerDesignation: 'string',
  
  // Address & Contact
  officeAddress: 'string',
  officePhone: 'string (optional)',
  
  // Status & Decision
  status: 'enum[PENDING, APPROVED, REJECTED]',
  decidedBy: 'UUID or ObjectId | null',  // References User.id (SUPER_ADMIN)
  decidedAt: 'datetime | null',
  decisionNotes: 'string | null',
  
  // Created Department (after approval)
  createdDepartmentId: 'UUID or ObjectId | null',
  createdAdminUserId: 'UUID or ObjectId | null',
  
  submittedAt: 'datetime',
  ipAddress: 'string',
  userAgent: 'string'
};

/**
 * AUTH LOG MODEL
 * Comprehensive audit trail for all authentication events
 */
export const AuthLogSchema = {
  id: 'UUID or ObjectId',
  userId: 'UUID or ObjectId | null',  // null if user not identified
  role: 'string | null',
  departmentId: 'UUID or ObjectId | null',
  
  // Event Details
  event: 'enum[LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, TOKEN_EXPIRED, etc.]',
  emailOrEmployeeId: 'string | null',  // Attempted login identifier
  result: 'enum[SUCCESS, FAIL]',
  failureReason: 'string | null',
  
  // Request Metadata
  ipAddress: 'string',
  userAgent: 'string',
  timestamp: 'datetime',
  
  // Additional Context
  metadata: {
    sessionId: 'string (optional)',
    jti: 'string (JWT ID for token tracking)',
    attemptCount: 'number (for failed logins)'
  }
};

/**
 * SESSION/TOKEN MODEL (Optional - for server-side token tracking)
 * Used for logout, revocation, and concurrent session management
 */
export const SessionSchema = {
  id: 'UUID or ObjectId',
  jti: 'string (unique)',  // JWT ID
  userId: 'UUID or ObjectId',
  role: 'string',
  departmentId: 'UUID or ObjectId | null',
  
  issuedAt: 'datetime',
  expiresAt: 'datetime',
  revokedAt: 'datetime | null',
  isActive: 'boolean',
  
  // Request Metadata
  ipAddress: 'string',
  userAgent: 'string',
  
  lastActivityAt: 'datetime'
};

/**
 * PASSWORD RESET REQUEST MODEL (Future Enhancement)
 * For controlled password reset flow via email/admin
 */
export const PasswordResetRequestSchema = {
  id: 'UUID or ObjectId',
  userId: 'UUID or ObjectId',
  token: 'string (hashed)',
  status: 'enum[PENDING, USED, EXPIRED]',
  expiresAt: 'datetime',
  createdAt: 'datetime',
  usedAt: 'datetime | null',
  ipAddress: 'string',
  userAgent: 'string'
};

/**
 * RATE LIMIT TRACKING MODEL
 * For login attempt throttling and brute force protection
 */
export const RateLimitSchema = {
  id: 'UUID or ObjectId',
  identifier: 'string (email or IP)',
  attemptType: 'enum[LOGIN, PASSWORD_RESET, API_CALL]',
  attemptCount: 'number',
  firstAttemptAt: 'datetime',
  lastAttemptAt: 'datetime',
  blockedUntil: 'datetime | null',
  isBlocked: 'boolean'
};

// Example Relationships
export const Relationships = {
  User: {
    belongsTo: 'Department (departmentId)',
    createdBy: 'User (createdBy)',
    hasManyLogEntries: 'AuthLog[]',
    hasManyActiveSessions: 'Session[]'
  },
  Department: {
    hasMany: 'User[]',
    belongsTo: 'Department (parentDepartmentId, optional)',
    createdBy: 'User (SUPER_ADMIN)'
  },
  DepartmentRegistrationRequest: {
    decidedBy: 'User (SUPER_ADMIN)',
    createsOnApproval: ['Department', 'User (DEPARTMENT_ADMIN)']
  },
  AuthLog: {
    belongsTo: 'User (userId, optional)',
    belongsTo: 'Department (departmentId, optional)'
  },
  Session: {
    belongsTo: 'User (userId)',
    belongsTo: 'Department (departmentId, optional)'
  }
};

// Indexes for Performance
export const RecommendedIndexes = {
  User: [
    'email (unique)',
    'employeeId (unique)',
    'departmentId',
    'status',
    'role',
    'createdBy'
  ],
  Department: [
    'name (unique)',
    'code (unique)',
    'status',
    'level'
  ],
  DepartmentRegistrationRequest: [
    'status',
    'decidedBy',
    'submittedAt'
  ],
  AuthLog: [
    'userId',
    'timestamp (desc)',
    'event',
    'ipAddress',
    'departmentId'
  ],
  Session: [
    'jti (unique)',
    'userId',
    'isActive',
    'expiresAt'
  ],
  RateLimit: [
    'identifier (unique)',
    'blockedUntil',
    'lastAttemptAt'
  ]
};

export default {
  UserSchema,
  DepartmentSchema,
  DepartmentRegistrationRequestSchema,
  AuthLogSchema,
  SessionSchema,
  PasswordResetRequestSchema,
  RateLimitSchema,
  Relationships,
  RecommendedIndexes
};
