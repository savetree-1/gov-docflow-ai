/****** Analytics API Routes Module for Document Management System ******/
/****** Provides various analytics endpoints including statistical data for dashboards  ******/

const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const User = require('../models/User');
const Department = require('../models/Department');
const AuditLog = require('../models/AuditLog');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

/****** Get Endpoint for document statistics over time accessed through  GET /api/analytics/documents-over-time ******/
router.get('/documents-over-time', authMiddleware, async (req, res) => {
  try {
    const { days = 30, department } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const matchQuery = {
      createdAt: { $gte: startDate },
      isDeleted: { $ne: true }
    };

    // Filter by department if provided (for Dept Admin)
    if (department) {
      matchQuery.department = require('mongoose').Types.ObjectId(department);
    }

    const documentsOverTime = await Document.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: documentsOverTime.map(item => ({
        date: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Error fetching documents over time:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get Endpoint department performance comparison accessed throug GET /api/analytics/department-performance ******/
router.get('/department-performance', authMiddleware, async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true });
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const totalDocs = await Document.countDocuments({
          department: dept._id,
          isDeleted: { $ne: true }
        });

        const approvedDocs = await Document.countDocuments({
          department: dept._id,
          status: 'Approved',
          isDeleted: { $ne: true }
        });

        const pendingDocs = await Document.countDocuments({
          department: dept._id,
          status: { $in: ['Pending', 'In Progress'] },
          isDeleted: { $ne: true }
        });

        const avgProcessingTime = await Document.aggregate([
          {
            $match: {
              department: dept._id,
              status: 'Approved',
              isDeleted: { $ne: true }
            }
          },
          {
            $project: {
              processingTime: {
                $subtract: ['$updatedAt', '$createdAt']
              }
            }
          },
          {
            $group: {
              _id: null,
              avgTime: { $avg: '$processingTime' }
            }
          }
        ]);

        return {
          departmentName: dept.name,
          departmentCode: dept.code,
          totalDocuments: totalDocs,
          approved: approvedDocs,
          pending: pendingDocs,
          avgProcessingHours: avgProcessingTime.length > 0 
            ? Math.round(avgProcessingTime[0].avgTime / (1000 * 60 * 60))
            : 0
        };
      })
    );

    res.json({
      success: true,
      data: departmentStats.filter(stat => stat.totalDocuments > 0)
    });
  } catch (error) {
    console.error('Error fetching department performance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get Endpoint for document status distribution accessed through GET /api/analytics/status-distribution ******/
router.get('/status-distribution', authMiddleware, async (req, res) => {
  try {
    const { department } = req.query;

    const matchQuery = { isDeleted: { $ne: true } };

    // Filter by department if provided
    if (department) {
      matchQuery.department = require('mongoose').Types.ObjectId(department);
    }

    const statusDistribution = await Document.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: statusDistribution.map(item => ({
        status: item._id || 'Unknown',
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get Endpoint for urgency distribution accessed through GET /api/analytics/urgency-distribution ******/
router.get('/urgency-distribution', authMiddleware, async (req, res) => {
  try {
    const urgencyDistribution = await Document.aggregate([
      {
        $match: { isDeleted: { $ne: true } }
      },
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: urgencyDistribution.map(item => ({
        urgency: item._id || 'Normal',
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Error fetching urgency distribution:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get Endpoint for processing time trends accessed with GET /api/analytics/processing-trends ******/
router.get('/processing-trends', authMiddleware, async (req, res) => {
  try {
    const { days = 30, department } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const matchQuery = {
      createdAt: { $gte: startDate },
      status: 'Approved',
      isDeleted: { $ne: true }
    };

    // Filter by department if provided
    if (department) {
      matchQuery.department = require('mongoose').Types.ObjectId(department);
    }

    const processingTrends = await Document.aggregate([
      {
        $match: matchQuery
      },
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          processingHours: {
            $divide: [
              { $subtract: ['$updatedAt', '$createdAt'] },
              1000 * 60 * 60
            ]
          }
        }
      },
      {
        $group: {
          _id: '$date',
          avgProcessingHours: { $avg: '$processingHours' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: processingTrends.map(item => ({
        date: item._id,
        avgHours: Math.round(item.avgProcessingHours * 10) / 10,
        documentsProcessed: item.count
      }))
    });
  } catch (error) {
    console.error('Error fetching processing trends:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get Endpoint for user activity statistics accessed with GET /api/analytics/user-activity ******/
router.get('/user-activity', authMiddleware, roleMiddleware('SUPER_ADMIN'), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const userActivity = await AuditLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          actions: { $sum: 1 },
          uniqueUsers: { $addToSet: '$performedBy' }
        }
      },
      {
        $project: {
          date: '$_id',
          actions: 1,
          activeUsers: { $size: '$uniqueUsers' }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    res.json({
      success: true,
      data: userActivity.map(item => ({
        date: item.date,
        actions: item.actions,
        activeUsers: item.activeUsers
      }))
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Get Endpoint for comprehensive dashboard summary accessed with GET /api/analytics/dashboard-summary ******/
router.get('/dashboard-summary', authMiddleware, async (req, res) => {
  try {
    const [
      totalDocuments,
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments,
      totalDepartments,
      activeDepartments,
      totalUsers,
      activeUsersCount,
      todayDocuments
    ] = await Promise.all([
      Document.countDocuments({ isDeleted: { $ne: true } }),
      Document.countDocuments({ status: { $in: ['Pending', 'In Progress'] }, isDeleted: { $ne: true } }),
      Document.countDocuments({ status: 'Approved', isDeleted: { $ne: true } }),
      Document.countDocuments({ status: 'Rejected', isDeleted: { $ne: true } }),
      Department.countDocuments(),
      Department.countDocuments({ isActive: true }),
      User.countDocuments(),
      User.countDocuments({ 'preferences.emailNotifications': true }),
      Document.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        },
        isDeleted: { $ne: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        documents: {
          total: totalDocuments,
          pending: pendingDocuments,
          approved: approvedDocuments,
          rejected: rejectedDocuments,
          today: todayDocuments
        },
        departments: {
          total: totalDepartments,
          active: activeDepartments
        },
        users: {
          total: totalUsers,
          active: activeUsersCount
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
