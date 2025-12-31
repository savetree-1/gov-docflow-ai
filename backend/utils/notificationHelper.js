const Notification = require('../models/Notification');

/**
 * Helper functions to create notifications for various actions
 */

/**
 * Create notification when document is assigned
 */
async function notifyDocumentAssigned(document, assigneeId, assignedBy) {
  try {
    await Notification.createNotification({
      user: assigneeId,
      type: 'document_assigned',
      title: 'New Document Assigned',
      message: `Document "${document.title}" has been assigned to you for review`,
      documentId: document._id,
      relatedUserId: assignedBy,
      priority: document.urgency === 'High' ? 'high' : 'normal',
      actionUrl: `/document/${document._id}`,
      metadata: {
        documentNumber: document.documentNumber,
        category: document.category,
        urgency: document.urgency
      }
    });
  } catch (error) {
    console.error('Error creating document assigned notification:', error);
  }
}

/**
 * Create notification when document is approved
 */
async function notifyDocumentApproved(document, uploaderId, approvedBy) {
  try {
    await Notification.createNotification({
      user: uploaderId,
      type: 'document_approved',
      title: 'Document Approved',
      message: `Your document "${document.title}" has been approved`,
      documentId: document._id,
      relatedUserId: approvedBy,
      priority: 'normal',
      actionUrl: `/document/${document._id}`,
      metadata: {
        documentNumber: document.documentNumber,
        category: document.category
      }
    });
  } catch (error) {
    console.error('Error creating document approved notification:', error);
  }
}

/**
 * Create notification when document is rejected
 */
async function notifyDocumentRejected(document, uploaderId, rejectedBy, reason) {
  try {
    await Notification.createNotification({
      user: uploaderId,
      type: 'document_rejected',
      title: 'Document Rejected',
      message: `Your document "${document.title}" has been rejected${reason ? ': ' + reason : ''}`,
      documentId: document._id,
      relatedUserId: rejectedBy,
      priority: 'high',
      actionUrl: `/document/${document._id}`,
      metadata: {
        documentNumber: document.documentNumber,
        category: document.category,
        rejectionReason: reason
      }
    });
  } catch (error) {
    console.error('Error creating document rejected notification:', error);
  }
}

/**
 * Create notification when document is forwarded
 */
async function notifyDocumentForwarded(document, recipientId, forwardedBy) {
  try {
    await Notification.createNotification({
      user: recipientId,
      type: 'document_forwarded',
      title: 'Document Forwarded to You',
      message: `Document "${document.title}" has been forwarded to you`,
      documentId: document._id,
      relatedUserId: forwardedBy,
      priority: document.urgency === 'High' ? 'high' : 'normal',
      actionUrl: `/document/${document._id}`,
      metadata: {
        documentNumber: document.documentNumber,
        category: document.category
      }
    });
  } catch (error) {
    console.error('Error creating document forwarded notification:', error);
  }
}

/**
 * Create notification when comment is added
 */
async function notifyCommentAdded(document, recipientId, commentedBy, comment) {
  try {
    await Notification.createNotification({
      user: recipientId,
      type: 'comment_added',
      title: 'New Comment on Document',
      message: `New comment added on "${document.title}"`,
      documentId: document._id,
      relatedUserId: commentedBy,
      priority: 'normal',
      actionUrl: `/document/${document._id}`,
      metadata: {
        documentNumber: document.documentNumber,
        comment: comment.substring(0, 100)
      }
    });
  } catch (error) {
    console.error('Error creating comment added notification:', error);
  }
}

/**
 * Create notification for deadline reminder
 */
async function notifyDeadlineReminder(document, userId, daysLeft) {
  try {
    await Notification.createNotification({
      user: userId,
      type: 'deadline_reminder',
      title: 'Deadline Reminder',
      message: `Document "${document.title}" is due in ${daysLeft} day(s)`,
      documentId: document._id,
      priority: daysLeft <= 1 ? 'urgent' : 'high',
      actionUrl: `/document/${document._id}`,
      metadata: {
        documentNumber: document.documentNumber,
        daysLeft: daysLeft
      }
    });
  } catch (error) {
    console.error('Error creating deadline reminder notification:', error);
  }
}

/**
 * Create notification when user is created
 */
async function notifyUserCreated(userId, createdBy, role) {
  try {
    await Notification.createNotification({
      user: userId,
      type: 'user_created',
      title: 'Welcome to Document Management System',
      message: `Your account has been created with role: ${role}`,
      relatedUserId: createdBy,
      priority: 'normal',
      actionUrl: '/settings',
      metadata: {
        role: role
      }
    });
  } catch (error) {
    console.error('Error creating user created notification:', error);
  }
}

/**
 * Create notification when user role is changed
 */
async function notifyRoleChanged(userId, newRole, changedBy) {
  try {
    await Notification.createNotification({
      user: userId,
      type: 'role_changed',
      title: 'Role Updated',
      message: `Your role has been updated to: ${newRole}`,
      relatedUserId: changedBy,
      priority: 'high',
      actionUrl: '/settings',
      metadata: {
        newRole: newRole
      }
    });
  } catch (error) {
    console.error('Error creating role changed notification:', error);
  }
}

/**
 * Notify all department admins about new document
 */
async function notifyDepartmentAdmins(departmentId, document, uploadedBy) {
  try {
    const User = require('../models/User');
    const admins = await User.find({
      department: departmentId,
      role: 'DEPARTMENT_ADMIN',
      status: 'Active'
    });

    const notifications = admins.map(admin => ({
      user: admin._id,
      type: 'document_assigned',
      title: 'New Document in Department',
      message: `New document "${document.title}" uploaded to your department`,
      documentId: document._id,
      relatedUserId: uploadedBy,
      priority: document.urgency === 'High' ? 'high' : 'normal',
      actionUrl: `/document/${document._id}`,
      metadata: {
        documentNumber: document.documentNumber,
        category: document.category
      }
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error notifying department admins:', error);
  }
}

module.exports = {
  notifyDocumentAssigned,
  notifyDocumentApproved,
  notifyDocumentRejected,
  notifyDocumentForwarded,
  notifyCommentAdded,
  notifyDeadlineReminder,
  notifyUserCreated,
  notifyRoleChanged,
  notifyDepartmentAdmins
};
