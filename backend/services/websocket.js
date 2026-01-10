/**
 * WebSocket Service
 * Real-time notifications for document actions
 */

const socketIO = require('socket.io');

class WebSocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> socketId mapping
  }

  /**
   * Initialize WebSocket server
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.on('connection', (socket) => {
      console.log('✅ WebSocket client connected:', socket.id);

      // Handle user registration
      socket.on('register', (userId) => {
        if (userId) {
          this.userSockets.set(userId, socket.id);
          socket.userId = userId;
          console.log(`📱 User ${userId} registered with socket ${socket.id}`);
          
          // Send connection confirmation
          socket.emit('registered', { 
            success: true, 
            message: 'Connected to real-time notifications' 
          });
        }
      });

      // Handle document updates subscription
      socket.on('subscribe:document', (documentId) => {
        socket.join(`document:${documentId}`);
        console.log(`📄 Socket ${socket.id} subscribed to document ${documentId}`);
      });

      // Handle department subscription
      socket.on('subscribe:department', (departmentId) => {
        socket.join(`department:${departmentId}`);
        console.log(`🏢 Socket ${socket.id} subscribed to department ${departmentId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
          console.log(`❌ User ${socket.userId} disconnected`);
        }
      });
    });

    console.log('🚀 WebSocket service initialized');
  }

  /**
   * Send notification to specific user
   * @param {String} userId - User ID
   * @param {Object} notification - Notification data
   */
  notifyUser(userId, notification) {
    if (!this.io) return;

    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
      console.log(`📨 Notification sent to user ${userId}`);
    }
  }

  /**
   * Send document update to all subscribers
   * @param {String} documentId - Document ID
   * @param {Object} update - Update data
   */
  notifyDocumentUpdate(documentId, update) {
    if (!this.io) return;

    this.io.to(`document:${documentId}`).emit('document:update', {
      documentId,
      ...update,
      timestamp: new Date().toISOString()
    });
    console.log(`📄 Document update sent for ${documentId}`);
  }

  /**
   * Send notification to entire department
   * @param {String} departmentId - Department ID
   * @param {Object} notification - Notification data
   */
  notifyDepartment(departmentId, notification) {
    if (!this.io) return;

    this.io.to(`department:${departmentId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    console.log(`🏢 Notification sent to department ${departmentId}`);
  }

  /**
   * Broadcast notification to all connected users
   * @param {Object} notification - Notification data
   */
  broadcast(notification) {
    if (!this.io) return;

    this.io.emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    console.log('📢 Broadcast notification sent');
  }

  /**
   * Send real-time AI processing status
   * @param {String} documentId - Document ID
   * @param {String} status - Processing status
   * @param {Object} data - Additional data
   */
  notifyAIStatus(documentId, status, data = {}) {
    if (!this.io) return;

    this.io.to(`document:${documentId}`).emit('ai:status', {
      documentId,
      status, // 'processing', 'completed', 'failed'
      ...data,
      timestamp: new Date().toISOString()
    });
    console.log(`🤖 AI status update: ${status} for document ${documentId}`);
  }

  /**
   * Send blockchain verification status
   * @param {String} documentId - Document ID
   * @param {Object} blockchainData - Blockchain transaction data
   */
  notifyBlockchainVerification(documentId, blockchainData) {
    if (!this.io) return;

    this.io.to(`document:${documentId}`).emit('blockchain:verified', {
      documentId,
      ...blockchainData,
      timestamp: new Date().toISOString()
    });
    console.log(`🔗 Blockchain verification sent for document ${documentId}`);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.userSockets.size;
  }

  /**
   * Check if user is online
   * @param {String} userId - User ID
   */
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }
}

// Singleton instance
const websocketService = new WebSocketService();

module.exports = websocketService;
