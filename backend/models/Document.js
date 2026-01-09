const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  referenceNumber: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['finance', 'land', 'hr', 'infrastructure', 'policy', 'legal', 'other']
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In_Progress', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  tags: [{
    type: String,
    trim: true
  }],
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  /****** Department selected by officer during upload ******/
  initialDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  /****** Department after AI routing confirmation ******/
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: false
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  currentStage: {
    type: String,
    default: 'Initial Review'
  },
  deadline: {
    type: Date
  },
  summary: {
    type: String,
    trim: true
  },
  keyPoints: [{
    type: String,
    trim: true
  }],
  extractedText: {
    type: String
  },
  /****** AI Auto-Routing Fields ******/
  suggestedDepartment: {
    type: String,
    trim: true
  },
  suggestedOfficerRole: {
    type: String,
    trim: true
  },
  routingConfidence: {
    type: Number,
    min: 0,
    max: 100
  },
  routingReason: {
    type: String,
    trim: true
  },
  routingConfirmed: {
    type: Boolean,
    default: false
  },
  routingConfirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  routingConfirmedAt: {
    type: Date
  },
  /****** Blockchain verification ******/
  blockchainTxHash: {
    type: String,
    trim: true
  },
  blockchainVerified: {
    type: Boolean,
    default: false
  },
  actionHistory: [{
    action: {
      type: String,
      enum: ['Upload', 'Route', 'Assign', 'Approve', 'Reject', 'Forward', 'Comment', 'Download', 'Print', 'View', 'Edit', 'ConfirmRouting'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  /****** Soft Delete Fields ******/
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deleteReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

/****** Indexes for search and filtering ******/
documentSchema.index({ referenceNumber: 1 });
documentSchema.index({ category: 1, status: 1 });
documentSchema.index({ department: 1 });
documentSchema.index({ assignedTo: 1 });
documentSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Document', documentSchema);
