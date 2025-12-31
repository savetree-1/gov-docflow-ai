const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications with optional filters
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      read, 
      type, 
      priority, 
      limit = 50, 
      skip = 0 
    } = req.query;

    // Build query
    const query = { user: userId };
    
    if (read !== undefined) {
      query.read = read === 'true';
    }
    
    if (type) {
      query.type = type;
    }
    
    if (priority) {
      query.priority = priority;
    }

    // Fetch notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('documentId', 'title documentNumber category')
      .populate('relatedUserId', 'firstName lastName email')
      .lean();

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        total: notifications.length
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({
      _id: id,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/notifications/clear-all
 * @desc    Clear all read notifications
 * @access  Private
 */
router.delete('/clear-all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await Notification.deleteMany({
      user: userId,
      read: true
    });

    res.json({
      success: true,
      message: `${result.deletedCount} notifications cleared`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications',
      error: error.message
    });
  }
});

module.exports = router;
