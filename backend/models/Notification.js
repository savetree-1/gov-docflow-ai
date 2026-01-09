const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'document_assigned',
      'document_approved',
      'document_rejected',
      'document_forwarded',
      'document_routed',
      'comment_added',
      'deadline_reminder',
      'user_created',
      'role_changed',
      'status_changed'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  relatedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  actionUrl: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

/****** Index for efficient queries ******/
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

/****** Virtual for age of notification ******/
notificationSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

/****** Method to mark as read ******/
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

/****** Static method to create notification ******/
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = new this(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/****** Static method to get user's unread count ******/
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ user: userId, read: false });
};

/****** Static method to mark all as read ******/
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { user: userId, read: false },
    { read: true, readAt: new Date() }
  );
};

/****** Auto-delete old notifications after 30 days ******/
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
