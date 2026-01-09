const mongoose = require('mongoose');

const routingRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  conditions: {
    category: {
      type: String,
      enum: ['finance', 'land', 'hr', 'infrastructure', 'policy', 'legal', 'other', 'any']
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'any']
    },
    keywords: [String]
  },
  assignTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

/****** Index for efficient rule matching ******/
routingRuleSchema.index({ department: 1, 'conditions.category': 1, isActive: 1 });

module.exports = mongoose.model('RoutingRule', routingRuleSchema);
