const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { authMiddleware } = require('../middleware/auth');

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const userId = req.user?.userId || 'temp';
    cb(null, 'profile-' + userId + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG and PNG images are allowed'));
    }
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, employeeId, role, departmentId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or employee ID already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      employeeId,
      role: role || 'OFFICER',
      department: departmentId,
      isActive: true,
      isApproved: role === 'OFFICER' // Officers auto-approved, admins need super admin approval
    });

    await user.save();

    // Log audit
    await AuditLog.create({
      action: 'REGISTER',
      performedBy: user._id,
      details: `New user registered: ${email}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).populate('department');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if user is active and approved
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    if (!user.isApproved) {
      return res.status(403).json({ success: false, message: 'Account pending approval' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        department: user.department  // Add department to JWT
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Log audit
    await AuditLog.create({
      action: 'LOGIN',
      performedBy: user._id,
      details: `User logged in: ${email}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          department: user.department,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get user to include latest role and department
    const user = await User.findById(decoded.userId).select('role department');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    // Generate new access token
    const accessToken = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        department: user.department
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      data: { accessToken }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // Log audit
    await AuditLog.create({
      action: 'LOGOUT',
      performedBy: req.user.userId,
      details: 'User logged out',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('department');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Convert to plain object and add full URL for profile photo
    const userData = user.toObject();
    if (userData.profilePhoto) {
      userData.profilePhoto = `${process.env.BASE_URL || 'http://localhost:5001'}${userData.profilePhoto}`;
    }

    res.json({ success: true, data: userData });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, phone, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName, phone, preferences },
      { new: true, runValidators: true }
    ).select('-password');

    await AuditLog.create({
      action: 'SETTINGS_UPDATE',
      performedBy: req.user.userId,
      details: 'Profile updated',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await AuditLog.create({
      action: 'PASSWORD_CHANGE',
      performedBy: req.user.userId,
      details: 'Password changed',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Upload profile photo
router.post('/upload-photo', authMiddleware, (req, res, next) => {
  upload.single('profilePhoto')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false, 
          message: 'File size too large. Maximum size is 2MB' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: `Upload error: ${err.message}` 
      });
    } else if (err) {
      // Other errors
      return res.status(400).json({ 
        success: false, 
        message: err.message || 'Failed to upload file' 
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      // Delete uploaded file if user not found
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete old profile photo if exists
    if (user.profilePhoto) {
      const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
      if (fs.existsSync(oldPhotoPath)) {
        try {
          fs.unlinkSync(oldPhotoPath);
        } catch (err) {
          console.error('Error deleting old photo:', err);
        }
      }
    }

    // Save new photo path (relative to backend root)
    const photoPath = `/uploads/profiles/${req.file.filename}`;
    user.profilePhoto = photoPath;
    await user.save();

    // Log audit
    await AuditLog.create({
      action: 'UPDATE_PROFILE_PHOTO',
      performedBy: user._id,
      details: 'Profile photo updated',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        profilePhoto: `${process.env.BASE_URL || 'http://localhost:5001'}${photoPath}`
      }
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    // Delete uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

module.exports = router;
