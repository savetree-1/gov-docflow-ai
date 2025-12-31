/**
 * Backend Server Integration Example
 * Express.js setup with authentication & authorization
 * This file shows how to integrate all auth components
 */

require('dotenv').config(); // Load env vars first

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const userRoutes = require('./routes/userRoutes');

// Import middleware
const { requireAuth, requireRole } = require('./middleware/rbacMiddleware');
const { USER_ROLES } = require('./constants/auth');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"], // Added 'blob:' for PDF previews
      connectSrc: ["'self'", "https://firebasestorage.googleapis.com"] // Allow Firebase Storage
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  // Allows localhost + your deployment URL
  origin: [
    'http://localhost:3000', 
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
// INCREASED LIMIT: 50mb needed for PDF scans (Default 10mb is too small for some scans)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting for auth endpoints
// OPTIMIZED: Relaxed to 20 to prevent lockout during demo
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Increased from 5 to 20
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // Increased to 200 for dashboard polling
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.'
  }
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Auth routes (with rate limiting)
app.use('/api/auth', authLimiter, authRoutes);

// Department routes
app.use('/api/departments', apiLimiter, departmentRoutes);

// User management routes (authenticated only)
app.use('/api/users', apiLimiter, userRoutes);

// Protected example routes
app.get('/api/admin/stats', 
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN),
  (req, res) => {
    // REVERTED TO ORIGINAL LOGIC
    res.json({
      success: true,
      data: {
        totalDepartments: 0,
        totalUsers: 0,
        pendingRequests: 0
      }
    });
  }
);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const isDev = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    success: false,
    code: err.code || 'SERVER_ERROR',
    message: err.message || 'Internal server error',
    ...(isDev && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  Government Platform Backend Server                        ║
║  Environment: ${process.env.NODE_ENV || 'development'}     ║
║  Port: ${PORT}                                             ║
║  Started at: ${new Date().toISOString()}                   ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;