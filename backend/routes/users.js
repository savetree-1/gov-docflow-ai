const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

/****** Get all users for admin only ******/
router.get('/', authMiddleware, roleMiddleware('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), async (req, res) => {
  try {
    const { role, department, isApproved, search, page = 1, limit = 20 } = req.query;

    console.log('\nGET /api/users request');
    console.log('   Authenticated User:', req.user);
    console.log('   Query Params:', req.query);

    const query = {};

    /****** Department admins can only see their department users ******/
    if (req.user.role === 'DEPARTMENT_ADMIN') {
      console.log('DEBUG: Department Admin Query');
      console.log('   User ID:', req.user.userId);
      console.log('   User Role:', req.user.role);
      console.log('   User Department:', req.user.department);
      /****** If department is populated (object), extract the _id, otherwise use as it is ******/
      query.department = req.user.department?._id || req.user.department;
      console.log('   Query will be:', JSON.stringify(query));
    }

    /****** Applying the following filters ******/
    if (role) query.role = role;
    if (department) query.department = department;
    if (isApproved !== undefined && isApproved !== '') query.isApproved = isApproved === 'true';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Final MongoDB Query:', JSON.stringify(query));

    const users = await User.find(query)
      .select('-password')
      .populate('department', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    console.log(`Found ${users.length} users (total: ${count})`);

    res.json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get user by ID ******/
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('department', 'name code')
      .populate('createdBy', 'firstName lastName email');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Create new user endpoint for admin only ******/
router.post('/', authMiddleware, roleMiddleware('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, employeeId, role, departmentId } = req.body;

    /****** Department admins can only create officers in their department ******/
    if (req.user.role === 'DEPARTMENT_ADMIN' && role !== 'OFFICER') {
      return res.status(403).json({ success: false, message: 'Department admins can only create officers' });
    }

    /****** Check if user already exists ******/
    const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or employee ID already exists' 
      });
    }

    /****** Hashing the password fot auth******/
    const hashedPassword = await bcrypt.hash(password, 10);

    /****** Creating new user ******/
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      employeeId,
      role: role || 'OFFICER',
      department: departmentId || req.user.department,
      isActive: true,
      isApproved: true,
      createdBy: req.user.userId
    });

    await user.save();

    /****** Log audit ******/
    await AuditLog.create({
      action: 'USER_CREATE',
      performedBy: req.user.userId,
      targetUser: user._id,
      details: `Created user: ${email}`,
      metadata: { role, department: departmentId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('department');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Update user endpoint for admin only ******/
router.put('/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), async (req, res) => {
  try {
    const { firstName, lastName, phone, role, departmentId, isActive, isApproved, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
 
    /****** Department admins can only update users in their department ******/
    if (req.user.role === 'DEPARTMENT_ADMIN') {
      if (user.department.toString() !== req.user.department) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (role && role !== 'OFFICER') {
        return res.status(403).json({ success: false, message: 'Department admins can only manage officers' });
      }
    }

    /****** Updating the fields ******/
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (role && req.user.role === 'SUPER_ADMIN') user.role = role;
    if (departmentId && req.user.role === 'SUPER_ADMIN') user.department = departmentId;
    if (isActive !== undefined) user.isActive = isActive;
    if (isApproved !== undefined && req.user.role === 'SUPER_ADMIN') user.isApproved = isApproved;
    
    /****** Password reset for super admin only ******/
    if (password && req.user.role === 'SUPER_ADMIN') {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    /****** Log audit ******/
    await AuditLog.create({
      action: 'USER_UPDATE',
      performedBy: req.user.userId,
      targetUser: user._id,
      details: `Updated user: ${user.email}${password ? ' (password reset)' : ''}`,
      metadata: { ...req.body, password: password ? '***' : undefined },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('department');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Approve user for super admin only ******/
router.put('/:id/approve', authMiddleware, roleMiddleware('SUPER_ADMIN'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isApproved = true;
    await user.save();

    /****** Log audit ******/
    await AuditLog.create({
      action: 'USER_UPDATE',
      performedBy: req.user.userId,
      targetUser: user._id,
      details: `Approved user: ${user.email}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, message: 'User approved successfully' });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Delete user for super admin only ******/
router.delete('/:id', authMiddleware, roleMiddleware('SUPER_ADMIN'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    /****** Prevent deleting super admin ******/
    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot delete super admin' });
    }

    /****** Soft delete - deactivate instead of removing ******/
    user.isActive = false;
    await user.save();

    /****** Log audit ******/
    await AuditLog.create({
      action: 'USER_DELETE',
      performedBy: req.user.userId,
      targetUser: user._id,
      details: `Deactivated user: ${user.email}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get Endpoint for user statistics ******/
router.get('/stats/overview', authMiddleware, roleMiddleware('SUPER_ADMIN'), async (req, res) => {
  try {
    const [total, active, pending, byRole] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isApproved: false }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ]);

    const roleStats = {};
    byRole.forEach(item => {
      roleStats[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        total,
        active,
        pending,
        byRole: roleStats
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
