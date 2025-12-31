const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'REGISTER',
      'DOCUMENT_UPLOAD',
      'DOCUMENT_VIEW',
      'DOCUMENT_APPROVE',
      'DOCUMENT_REJECT',
      'DOCUMENT_FORWARD',
      'DOCUMENT_DELETE',
      'DOCUMENT_UPDATE',
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'UPDATE_PROFILE_PHOTO',
      'DEPARTMENT_REGISTER',
      'DEPARTMENT_APPROVE',
      'DEPARTMENT_REJECT',
      'ROUTING_RULE_CREATE',
      'ROUTING_RULE_UPDATE',
      'ROUTING_RULE_DELETE',
      'ROUTING_CONFIRMED',
      'SETTINGS_UPDATE',
      'PASSWORD_CHANGE'
    ]
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  targetDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  details: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // Using timestamp field instead
});

// Indexes for efficient querying
auditLogSchema.index({ performedBy: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ targetDocument: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
