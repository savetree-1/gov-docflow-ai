const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Register new department
router.post('/register', authMiddleware, roleMiddleware('DEPARTMENT_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { name, code, nodalOfficer } = req.body;

    // Check if department already exists
    const existingDept = await Department.findOne({ $or: [{ name }, { code }] });
    if (existingDept) {
      return res.status(400).json({ 
        success: false, 
        message: 'Department with this name or code already exists' 
      });
    }

    // Create new department
    const department = new Department({
      name,
      code,
      nodalOfficer: {
        name: nodalOfficer.name,
        email: nodalOfficer.email,
        phone: nodalOfficer.phone,
        designation: nodalOfficer.designation
      },
      status: req.user.role === 'SUPER_ADMIN' ? 'Approved' : 'Pending',
      isActive: req.user.role === 'SUPER_ADMIN',
      approvedBy: req.user.role === 'SUPER_ADMIN' ? req.user.userId : null,
      approvedAt: req.user.role === 'SUPER_ADMIN' ? new Date() : null
    });

    await department.save();

    // Log audit
    await AuditLog.create({
      action: 'DEPARTMENT_REGISTER',
      performedBy: req.user.userId,
      targetDepartment: department._id,
      details: `Department registered: ${name}`,
      metadata: { code, status: department.status },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      message: 'Department registered successfully',
      data: department
    });
  } catch (error) {
    console.error('Register department error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all departments (public endpoint - no auth required)
router.get('/', async (req, res) => {
  try {
    const { status, isActive, search, page = 1, limit = 20 } = req.query;

    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const departments = await Department.find(query)
      .populate('approvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Department.countDocuments(query);

    res.json({
      success: true,
      data: departments,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get department by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('approvedBy', 'firstName lastName email');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.json({ success: true, data: department });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve department (super admin only)
router.put('/:id/approve', authMiddleware, roleMiddleware('SUPER_ADMIN'), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    if (department.status === 'Approved') {
      return res.status(400).json({ success: false, message: 'Department already approved' });
    }

    department.status = 'Approved';
    department.isActive = true;
    department.approvedBy = req.user.userId;
    department.approvedAt = new Date();
    department.rejectionReason = undefined;

    await department.save();

    // Activate all users in this department (admins and officers)
    await User.updateMany(
      { department: department._id },
      { 
        $set: { 
          isApproved: true,
          isActive: true 
        } 
      }
    );

    // Log audit
    await AuditLog.create({
      action: 'DEPARTMENT_APPROVE',
      performedBy: req.user.userId,
      targetDepartment: department._id,
      details: `Approved department: ${department.name}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Department approved successfully',
      data: department
    });
  } catch (error) {
    console.error('Approve department error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject department (super admin only)
router.put('/:id/reject', authMiddleware, roleMiddleware('SUPER_ADMIN'), async (req, res) => {
  try {
    const { reason } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    department.status = 'Rejected';
    department.isActive = false;
    department.rejectionReason = reason;

    await department.save();

    // Deactivate all users in this department
    await User.updateMany(
      { department: department._id },
      { 
        $set: { 
          isApproved: false,
          isActive: false 
        } 
      }
    );

    // Log audit
    await AuditLog.create({
      action: 'DEPARTMENT_REJECT',
      performedBy: req.user.userId,
      targetDepartment: department._id,
      details: `Rejected department: ${department.name}`,
      metadata: { reason },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Department rejected successfully',
      data: department
    });
  } catch (error) {
    console.error('Reject department error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update department
router.put('/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), async (req, res) => {
  try {
    const { name, nodalOfficer, isActive } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Update fields
    if (name) department.name = name;
    if (nodalOfficer) {
      department.nodalOfficer = {
        name: nodalOfficer.name || department.nodalOfficer.name,
        email: nodalOfficer.email || department.nodalOfficer.email,
        phone: nodalOfficer.phone || department.nodalOfficer.phone,
        designation: nodalOfficer.designation || department.nodalOfficer.designation
      };
    }
    if (isActive !== undefined && req.user.role === 'SUPER_ADMIN') {
      department.isActive = isActive;
    }

    await department.save();

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get department statistics (super admin only)
router.get('/stats/overview', authMiddleware, roleMiddleware('SUPER_ADMIN'), async (req, res) => {
  try {
    const [total, active, pending, approved, rejected] = await Promise.all([
      Department.countDocuments(),
      Department.countDocuments({ isActive: true }),
      Department.countDocuments({ status: 'Pending' }),
      Department.countDocuments({ status: 'Approved' }),
      Department.countDocuments({ status: 'Rejected' })
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        pending,
        approved,
        rejected
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
