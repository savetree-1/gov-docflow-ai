const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

/****** Get EndPoint for audit logs ******/
router.get('/', authMiddleware, roleMiddleware('SUPER_ADMIN', 'AUDITOR'), async (req, res) => {
  try {
    const { 
      action, 
      performedBy, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50 
    } = req.query;

    const query = {};

    /****** Applying filters ******/
    if (action) query.action = action;
    if (performedBy) query.performedBy = performedBy;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('performedBy', 'firstName lastName email employeeId role')
      .populate('targetUser', 'firstName lastName email employeeId')
      .populate('targetDocument', 'title referenceNumber')
      .populate('targetDepartment', 'name code')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get Endpoint for audit log by ID ******/
router.get('/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'AUDITOR'), async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate('performedBy', 'firstName lastName email employeeId role')
      .populate('targetUser', 'firstName lastName email employeeId')
      .populate('targetDocument', 'title referenceNumber')
      .populate('targetDepartment', 'name code');

    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }

    res.json({ success: true, data: log });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get Endpoint for audit logs for specific document ******/
router.get('/document/:documentId', authMiddleware, async (req, res) => {
  try {
    const logs = await AuditLog.find({ targetDocument: req.params.documentId })
      .populate('performedBy', 'firstName lastName email employeeId role')
      .sort({ timestamp: -1 });

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get document audit logs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get Endpoint for audit logs for specific user ******/
router.get('/user/:userId', authMiddleware, roleMiddleware('SUPER_ADMIN', 'AUDITOR'), async (req, res) => {
  try {
    const logs = await AuditLog.find({ 
      $or: [
        { performedBy: req.params.userId },
        { targetUser: req.params.userId }
      ]
    })
      .populate('performedBy', 'firstName lastName email employeeId role')
      .populate('targetUser', 'firstName lastName email employeeId')
      .populate('targetDocument', 'title referenceNumber')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get user audit logs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get Endpoitn for audit statistics ******/
router.get('/stats/overview', authMiddleware, roleMiddleware('SUPER_ADMIN', 'AUDITOR'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.timestamp = {};
      if (startDate) dateQuery.timestamp.$gte = new Date(startDate);
      if (endDate) dateQuery.timestamp.$lte = new Date(endDate);
    }

    const [total, byAction, byUser] = await Promise.all([
      AuditLog.countDocuments(dateQuery),
      AuditLog.aggregate([
        { $match: dateQuery },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      AuditLog.aggregate([
        { $match: dateQuery },
        { $group: { _id: '$performedBy', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            count: 1,
            'user.firstName': 1,
            'user.lastName': 1,
            'user.email': 1
          }
        }
      ])
    ]);

    const actionStats = {};
    byAction.forEach(item => {
      actionStats[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        total,
        byAction: actionStats,
        topUsers: byUser
      }
    });
  } catch (error) {
    console.error('Audit stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get Endpoint for Exporting audit logs in teh form of CSV file ******/
router.get('/export/csv', authMiddleware, roleMiddleware('SUPER_ADMIN', 'AUDITOR'), async (req, res) => {
  try {
    const { startDate, endDate, action } = req.query;

    const query = {};
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('performedBy', 'firstName lastName email employeeId')
      .populate('targetDocument', 'title referenceNumber')
      .sort({ timestamp: -1 })
      .limit(10000); /****** Limiting the export to 10k records to avoid chaos ******/

    /****** Generate CSV ******/
    let csv = 'Timestamp,Action,Performed By,Email,Employee ID,Document,Details,IP Address\n';
    
    logs.forEach(log => {
      const performedBy = log.performedBy 
        ? `${log.performedBy.firstName} ${log.performedBy.lastName}`
        : 'Unknown';
      const email = log.performedBy?.email || '';
      const employeeId = log.performedBy?.employeeId || '';
      const document = log.targetDocument?.referenceNumber || '';
      const details = (log.details || '').replace(/,/g, ';');
      
      csv += `${log.timestamp},${log.action},"${performedBy}",${email},${employeeId},${document},"${details}",${log.ipAddress || ''}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
