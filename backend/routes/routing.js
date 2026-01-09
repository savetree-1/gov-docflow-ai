const express = require('express');
const router = express.Router();
const RoutingRule = require('../models/RoutingRule');
const AuditLog = require('../models/AuditLog');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

/****** Creating the routing rule ******/
router.post('/', authMiddleware, roleMiddleware('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), async (req, res) => {
  try {
    const { name, department, conditions, assignTo, priority } = req.body;

    /****** Department admins can only create rules for their department ******/
    const deptId = req.user.role === 'DEPARTMENT_ADMIN' ? req.user.department : department;

    const rule = new RoutingRule({
      name,
      department: deptId,
      conditions: {
        category: conditions.category || 'any',
        urgency: conditions.urgency || 'any',
        keywords: conditions.keywords || []
      },
      assignTo,
      priority: priority || 0,
      isActive: true,
      createdBy: req.user.userId
    });

    await rule.save();

    /****** Log audit ******/
    await AuditLog.create({
      action: 'ROUTING_RULE_CREATE',
      performedBy: req.user.userId,
      details: `Created routing rule: ${name}`,
      metadata: { department: deptId, conditions },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const populatedRule = await RoutingRule.findById(rule._id)
      .populate('department', 'name code')
      .populate('assignTo', 'firstName lastName email employeeId')
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Routing rule created successfully',
      data: populatedRule
    });
  } catch (error) {
    console.error('Create routing rule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get all routing rules ******/
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { department, isActive, page = 1, limit = 20 } = req.query;

    const query = {};

    /****** Department admins can only see their department rules ******/
    if (req.user.role === 'DEPARTMENT_ADMIN') {
      query.department = req.user.department;
    } else if (department) {
      query.department = department;
    }

    if (isActive !== undefined) query.isActive = isActive === 'true';

    const rules = await RoutingRule.find(query)
      .populate('department', 'name code')
      .populate('assignTo', 'firstName lastName email employeeId role')
      .populate('createdBy', 'firstName lastName email')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await RoutingRule.countDocuments(query);

    res.json({
      success: true,
      data: rules,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get routing rules error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get routing rule by ID ******/
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const rule = await RoutingRule.findById(req.params.id)
      .populate('department', 'name code')
      .populate('assignTo', 'firstName lastName email employeeId role')
      .populate('createdBy', 'firstName lastName email');

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Routing rule not found' });
    }

    res.json({ success: true, data: rule });
  } catch (error) {
    console.error('Get routing rule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Update routing rule ******/
router.put('/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), async (req, res) => {
  try {
    const { name, conditions, assignTo, priority, isActive } = req.body;

    const rule = await RoutingRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Routing rule not found' });
    }

    /****** Department admins can only update their department rules ******/
    if (req.user.role === 'DEPARTMENT_ADMIN' && rule.department.toString() !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    /****** Updating the fields ******/
    if (name) rule.name = name;
    if (conditions) {
      rule.conditions = {
        category: conditions.category || rule.conditions.category,
        urgency: conditions.urgency || rule.conditions.urgency,
        keywords: conditions.keywords || rule.conditions.keywords
      };
    }
    if (assignTo) rule.assignTo = assignTo;
    if (priority !== undefined) rule.priority = priority;
    if (isActive !== undefined) rule.isActive = isActive;

    await rule.save();

    // Log audit
    await AuditLog.create({
      action: 'ROUTING_RULE_UPDATE',
      performedBy: req.user.userId,
      details: `Updated routing rule: ${rule.name}`,
      metadata: req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const updatedRule = await RoutingRule.findById(rule._id)
      .populate('department', 'name code')
      .populate('assignTo', 'firstName lastName email employeeId')
      .populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Routing rule updated successfully',
      data: updatedRule
    });
  } catch (error) {
    console.error('Update routing rule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Delete routing rule ******/
router.delete('/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), async (req, res) => {
  try {
    const rule = await RoutingRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Routing rule not found' });
    }

    /****** Department admins can only delete their department rules ******/
    if (req.user.role === 'DEPARTMENT_ADMIN' && rule.department.toString() !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await RoutingRule.findByIdAndDelete(req.params.id);

    /****** Log audit ******/
    await AuditLog.create({
      action: 'ROUTING_RULE_DELETE',
      performedBy: req.user.userId,
      details: `Deleted routing rule: ${rule.name}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, message: 'Routing rule deleted successfully' });
  } catch (error) {
    console.error('Delete routing rule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Test routing rule includes finding matching rule for given document criteria ******/
router.post('/test', authMiddleware, async (req, res) => {
  try {
    const { department, category, urgency, tags } = req.body;

    const rule = await RoutingRule.findOne({
      department,
      'conditions.category': { $in: [category, 'any'] },
      'conditions.urgency': { $in: [urgency, 'any'] },
      isActive: true
    })
      .sort({ priority: -1 })
      .populate('assignTo', 'firstName lastName email employeeId role');

    if (!rule) {
      return res.json({
        success: true,
        message: 'No matching routing rule found',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Matching routing rule found',
      data: rule
    });
  } catch (error) {
    console.error('Test routing rule error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
