const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const RoutingRule = require('../models/RoutingRule');
const AuditLog = require('../models/AuditLog');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { extractText } = require('../services/extractText'); // NEW: Main extraction service
const { analyzeDocumentText, suggestRouting } = require('../services/aiService');
const { sendDocumentAssignment, sendRoutingNotification } = require('../services/emailService');
const blockchainService = require('../services/blockchain');
const {
  notifyDocumentAssigned,
  notifyDocumentApproved,
  notifyDocumentRejected,
  notifyDocumentForwarded,
  notifyCommentAdded
} = require('../utils/notificationHelper');

/****** AI Processing Function - Advance pipeline******/
async function processDocumentWithAI(documentId, filePath, mimeType) {
  try {
    console.log(`Starting AI processing for document ${documentId}`);
    console.log(`File: ${path.basename(filePath)}`);
    console.log(`Type: ${mimeType}`);
    
    /****** STEP 1: Extract text which includes teh following steps : PDF → pdf-parse, if < 100 chars → OCR, Image → OCR ******/
    const documentText = await extractText(filePath, mimeType);
    
    if (!documentText || documentText.length < 50) {
      console.log(`Minimal text extracted (${documentText.length} chars) - creating metadata summary`);
      
      // For scanned/image documents with no extractable text
      const document = await Document.findById(documentId);
      document.summary = `${document.category || 'Document'} uploaded for review. ` +
        `Priority: ${document.urgency || 'Medium'}. Please download and review manually.`;
      document.keyPoints = [
        `Title: ${document.title}`,
        `Category: ${document.category || 'General'}`,
        'Scanned document - manual review required'
      ];
      await document.save();
      console.log('Created metadata-based summary');
      return;
    }

    console.log(`Extracted ${documentText.length} characters`);

    /****** STEP 2: Send text to Gemini for AI analysis ******/
    const document = await Document.findById(documentId);
    const aiAnalysis = await analyzeDocumentText(documentText, {
      title: document.title,
      category: document.category
    });

    console.log(`AI generated summary (${aiAnalysis.summary?.length || 0} chars, ${aiAnalysis.keyPoints?.length || 0} points)`);

    /****** STEP 3: Get routing suggestions or department assignment ******/
    const routingSuggestion = await suggestRouting(documentText, {
      title: document.title,
      category: document.category
    });

    console.log(`AI Routing suggestion: ${routingSuggestion.primaryDepartment} (${routingSuggestion.reasoning})`);

    /****** STEP 4: SAVE routing suggestion (NOT auto-assign) ******/
    /****** Officer must confirm routing - this is AI-ASSISTED, not fully automatic one******/
    document.suggestedDepartment = routingSuggestion.primaryDepartment;
    document.routingReason = routingSuggestion.reasoning;
    document.routingConfidence = 85; // High confidence for Gemini analysis
    document.routingConfirmed = false; // Requires officer confirmation
    
    console.log(`Routing suggestion saved - awaiting officer confirmation`);

    /****** STEP 5: Save AI results to database ******/
    document.summary = aiAnalysis.summary;
    document.keyPoints = aiAnalysis.keyPoints;
    
    /****** Validating the deadline before setting it ******/
    if (aiAnalysis.deadlines?.[0]) {
      const deadlineDate = new Date(aiAnalysis.deadlines[0]);
      document.deadline = !isNaN(deadlineDate.getTime()) ? deadlineDate : null;
    } else {
      document.deadline = null;
    }
    
    document.urgency = aiAnalysis.priority || document.urgency;
    document.extractedText = documentText.substring(0, 5000); // Store first 5000 chars
    
    await document.save();
    
    console.log(`AI processing completed for document ${documentId}`);

    /****** STEP 6: Send email notification if assigned ******/
    if (document.assignedTo) {
      const User = require('../models/User');
      const assignedUser = await User.findById(document.assignedTo);
      if (assignedUser && assignedUser.email) {
        await sendDocumentAssignment(
          assignedUser.email,
          `${assignedUser.firstName} ${assignedUser.lastName}`,
          document
        );
        console.log(`Email sent to ${assignedUser.email}`);
      }
    }

  } catch (error) {
    console.error('AI Processing Error:', error);
  }
}

/****** Configuring the multer for file uploads ******/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'DOC-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});

/****** Endpoint to upload new document ******/
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title, category, urgency, tags, description, initialDepartment } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    if (!initialDepartment) {
      return res.status(400).json({ success: false, message: 'Department selection is required' });
    }

    /****** Verifying whether the department exists or not ? ******/
    const Department = require('../models/Department');
    const dept = await Department.findById(initialDepartment);
    if (!dept || !dept.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive department' });
    }

    /****** Generating a reference number ******/
    const refNumber = 'DOC-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    /****** Creatign new document ******/
    const document = new Document({
      title,
      referenceNumber: refNumber,
      category,
      urgency,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      description,
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user.userId,
      initialDepartment: initialDepartment, /****** Department which will be selected by officer ******/
      status: 'Pending',
      actionHistory: [{
        action: 'Upload',
        performedBy: req.user.userId,
        notes: `Document uploaded to ${dept.name}`,
        timestamp: new Date()
      }]
    });

    await document.save();

    /****** Log audit ******/
    await AuditLog.create({
      action: 'DOCUMENT_UPLOAD',
      performedBy: req.user.userId,
      targetDocument: document._id,
      details: `Document uploaded: ${title}`,
      metadata: { category, urgency, refNumber, department: dept.name },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    /****** Populating the references before sending response ******/
    await document.populate(['uploadedBy', 'initialDepartment', 'department', 'assignedTo']);

    /****** Triggering the AI processing in background and not waiting for it ******/
    processDocumentWithAI(document._id, req.file.path, req.file.mimetype).catch(err => {
      console.error('AI processing error:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully. AI processing started.',
      data: document
    });
  } catch (error) {
    console.error('Upload error:', error);
    /****** Deleting the uploaded file if document creation failed ******/
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Server error during upload' });
  }
});

/****** Endpoitn to get all documents with filters ******/
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, status, urgency, search, page = 1, limit = 20, includeDeleted } = req.query;

    const query = {};

    /****** Filtering out soft-deleted documents by default unless SUPER_ADMIN requests them ******/
    if (includeDeleted !== 'true' || req.user.role !== 'SUPER_ADMIN') {
      query.isDeleted = { $ne: true };
    }

    /****** Role-based filtering ******/
    if (req.user.role === 'OFFICER') {
      /****** Officers can see only documents they uploaded ******/
      query.uploadedBy = req.user.userId;
    } else if (req.user.role === 'DEPARTMENT_ADMIN') {
      /****** Department admins see documents where:
      1. initialDepartment matches (officer selected their dept during upload)
      2. OR department matches (AI routing confirmed to their dept) ******/
      query.$or = [
        { initialDepartment: req.user.department },
        { department: req.user.department }
      ];
    } else if (req.user.role === 'AUDITOR') {
      /****** Auditors can see all documents ******/
    }

    /****** Applying the following filters ******/
    if (category) query.category = category;
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (search) {
      /****** Preserve role-based filtering when searching ******/
      const searchConditions = [
        { title: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
      
      if (query.$or) {
        /****** For dept admins with existing $or, combine with search ******/
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions }
        ];
        delete query.$or;
      } else if (query.uploadedBy) {
        /****** For officers, add search on top of uploadedBy filter ******/
        query.$and = [
          { uploadedBy: query.uploadedBy },
          { $or: searchConditions }
        ];
        delete query.uploadedBy;
      } else {
        /****** For auditors, just apply search ******/
        query.$or = searchConditions;
      }
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'firstName lastName email employeeId')
      .populate('assignedTo', 'firstName lastName email employeeId')
      .populate('initialDepartment', 'name code')
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Document.countDocuments(query);

    res.json({
      success: true,
      data: documents,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Endpoint to access the document by ID ******/
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName email employeeId role')
      .populate('assignedTo', 'firstName lastName email employeeId role')
      .populate('department', 'name code')
      .populate('actionHistory.performedBy', 'firstName lastName email');

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    /****** Log audit ******/
    await AuditLog.create({
      action: 'DOCUMENT_VIEW',
      performedBy: req.user.userId,
      targetDocument: document._id,
      details: `Viewed document: ${document.title}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Endpoint for performing action on document which includes approve/reject/forward ******/
router.put('/:id/action', authMiddleware, async (req, res) => {
  try {
    const { action, notes, assignTo } = req.body;

    /****** Validating the action ******/
    const validActions = ['Approve', 'Reject', 'Forward', 'Comment', 'Download', 'Print', 'View', 'Edit'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    /****** Checking if user has permissions 
    View, Download, Print, Comment - any logged in user can do
    Approve, Reject, Forward, Edit - requires assignment or admin role ******/
    const requiresPermission = ['Approve', 'Reject', 'Forward', 'Edit'].includes(action);
    
    if (requiresPermission) {
      const hasPermission = 
        document.assignedTo?.toString() === req.user.userId ||
        req.user.role === 'SUPER_ADMIN' ||
        (req.user.role === 'DEPARTMENT_ADMIN' && document.department.toString() === req.user.department);

      if (!hasPermission) {
        return res.status(403).json({ success: false, message: 'Not authorized to perform this action' });
      }
    }

    /****** Updating the document status based on action ******/
    if (action === 'Approve') {
      document.status = 'Approved';
      /****** Notifying the document uploader ******/
      if (document.uploadedBy) {
        await notifyDocumentApproved(document, document.uploadedBy, req.user.userId);
      }
    } else if (action === 'Reject') {
      document.status = 'Rejected';
      /****** Notifying the document uploader ******/
      if (document.uploadedBy) {
        await notifyDocumentRejected(document, document.uploadedBy, req.user.userId, notes);
      }
    } else if (action === 'Forward' && assignTo) {
      document.assignedTo = assignTo;
      document.status = 'In_Progress';
      /****** Notifying the recipient ******/
      await notifyDocumentForwarded(document, assignTo, req.user.userId);
    }

    /****** Loging critical actions to blockchain which are immutable audit trail******/
    if (['Approve', 'Reject', 'Forward'].includes(action)) {
      try {
        const User = require('../models/User');
        const user = await User.findById(req.user.userId);
        const docHash = blockchainService.generateHash({
          id: document._id,
          title: document.title,
          status: document.status,
          timestamp: new Date()
        });
        
        const bcResult = await blockchainService.logAction({
          documentId: `PRAVAH-${document._id.toString().slice(-8).toUpperCase()}`,
          actionType: action.toUpperCase(),
          performedBy: `${user.firstName} ${user.lastName}` || user.email,
          role: user.role,
          department: document.category || 'General',
          documentHash: docHash,
          previousActionHash: ''
        });
        
        if (bcResult.success) {
          document.blockchainTxHash = bcResult.txHash;
          document.blockchainVerified = true;
        }
      } catch (bcError) {
        console.error('Blockchain logging failed:', bcError.message);
      }
    } else if (action === 'Comment' && notes) {
      /****** Notifying document owner and assignee about comment ******/ 
      if (document.uploadedBy && document.uploadedBy.toString() !== req.user.userId) {
        await notifyCommentAdded(document, document.uploadedBy, req.user.userId, notes);
      }
      if (document.assignedTo && document.assignedTo.toString() !== req.user.userId && document.assignedTo.toString() !== document.uploadedBy?.toString()) {
        await notifyCommentAdded(document, document.assignedTo, req.user.userId, notes);
      }
    }

    /****** Adding to action history ******/
    document.actionHistory.push({
      action,
      performedBy: req.user.userId,
      notes,
      timestamp: new Date()
    });

    await document.save();

    /****** Loging audit with appropriate action type ******/
    const auditActionMap = {
      'Approve': 'DOCUMENT_APPROVE',
      'Reject': 'DOCUMENT_REJECT',
      'Forward': 'DOCUMENT_FORWARD',
      'Comment': 'DOCUMENT_VIEW',
      'Download': 'DOCUMENT_VIEW',
      'Print': 'DOCUMENT_VIEW',
      'View': 'DOCUMENT_VIEW',
      'Edit': 'DOCUMENT_UPDATE'
    };

    await AuditLog.create({
      action: auditActionMap[action] || 'DOCUMENT_VIEW',
      performedBy: req.user.userId,
      targetDocument: document._id,
      details: `${action} document: ${document.title}`,
      metadata: { notes, assignTo, actionType: action },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });



    /****** Populate references ******/
    await document.populate(['uploadedBy', 'assignedTo', 'department', 'actionHistory.performedBy']);

    res.json({
      success: true,
      message: `Document ${action.toLowerCase()}ed successfully`,
      data: document
    });
  } catch (error) {
    console.error('Document action error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Post Endpoint for Confirm AI routing suggestion ******/
router.post('/:id/confirm-routing', authMiddleware, async (req, res) => {
  try {
    const { confirmed, modifiedDepartment } = req.body;
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    /****** Check permission and only uploader or admin can confirm routing ******/
    if (document.uploadedBy.toString() !== req.user.userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to confirm routing' });
    }

    const Department = require('../models/Department');
    let finalDepartment = null;

    if (confirmed && !modifiedDepartment) {
      /****** CONFIRM AI SUGGESTION ******/
      finalDepartment = await Department.findOne({
        name: new RegExp(document.suggestedDepartment, 'i'),
        isActive: true
      });

      if (!finalDepartment) {
        return res.status(400).json({
          success: false,
          message: `Department "${document.suggestedDepartment}" not found. Please select a department manually or ensure departments are registered.`
        });
      }

      document.department = finalDepartment._id;
      document.routingConfirmed = true;
      document.routingConfirmedBy = req.user.userId;
      document.routingConfirmedAt = new Date();
      document.status = 'In_Progress';

      /****** Adding the action to history ******/
      document.actionHistory.push({
        action: 'ConfirmRouting',
        performedBy: req.user.userId,
        notes: `Confirmed AI routing to ${finalDepartment.name}`,
        timestamp: new Date()
      });

      console.log(`Routing confirmed: ${finalDepartment.name}`);

    } else if (modifiedDepartment) {
      /****** OFFICER MODIFIED ROUTING ******/
      finalDepartment = await Department.findById(modifiedDepartment);

      if (finalDepartment) {
        document.department = finalDepartment._id;
        document.routingConfirmed = true;
        document.routingConfirmedBy = req.user.userId;
        document.routingConfirmedAt = new Date();
        document.status = 'In_Progress';

        /****** Add action to history ******/
        document.actionHistory.push({
          action: 'Route',
          performedBy: req.user.userId,
          notes: `Manually routed to ${finalDepartment.name} (Modified AI suggestion)`,
          timestamp: new Date()
        });

        console.log(`Routing modified: ${finalDepartment.name}`);
      }
    }

    /****** Log routing confirmation to blockchain ******/
    if (finalDepartment) {
      try {
        const User = require('../models/User');
        const confirmingUser = await User.findById(req.user.userId);
        const docHash = blockchainService.generateHash({
          id: document._id,
          title: document.title,
          department: finalDepartment.name,
          timestamp: new Date()
        });
        
        const bcResult = await blockchainService.logAction({
          documentId: `PRAVAAH-${document._id.toString().slice(-8).toUpperCase()}`,
          actionType: 'ROUTING_CONFIRMED',
          performedBy: `${confirmingUser.firstName} ${confirmingUser.lastName}`,
          role: confirmingUser.role,
          department: finalDepartment.name,
          documentHash: docHash,
          previousActionHash: ''
        });
        
        if (bcResult.success) {
          document.blockchainTxHash = bcResult.txHash;
          document.blockchainVerified = true;
        }
      } catch (bcError) {
        console.error('Blockchain logging failed:', bcError.message);
      }
    }

    await document.save();

    /****** Sending the email notifications to department admin and officers ******/
    if (finalDepartment) {
      try {
        const User = require('../models/User');
        const Notification = require('../models/Notification');
        
        /****** Get all users in the department for admin and officers ******/
        const departmentUsers = await User.find({
          department: finalDepartment._id,
          isActive: true,
          role: { $in: ['DEPARTMENT_ADMIN', 'OFFICER'] }
        }).select('_id email firstName lastName role');

        console.log(`Sending routing notifications to ${departmentUsers.length} users in ${finalDepartment.name}`);

        /****** Get the user who confirmed routing ******/
        const routingUser = await User.findById(req.user.userId);
        const routedBy = `${routingUser.firstName} ${routingUser.lastName}`;

        /****** Sending email and creating in-app notification for each user ******/
        for (const user of departmentUsers) {
          /****** Create in-app notification ******/
          await Notification.create({
            user: user._id,
            type: 'document_routed',
            title: 'New Document Routed to Your Department',
            message: `Document "${document.title}" has been routed to ${finalDepartment.name} department by ${routedBy}`,
            documentId: document._id,
            relatedUserId: req.user.userId,
            priority: document.urgency === 'High' ? 'high' : document.urgency === 'Medium' ? 'medium' : 'low',
            actionUrl: `/document/${document._id}`,
            metadata: {
              documentNumber: document.documentNumber,
              category: document.category,
              urgency: document.urgency,
              routedToDepartment: finalDepartment.name,
              routedToDepartmentId: finalDepartment._id,
              routedBy: routedBy,
              officerName: `${user.firstName} ${user.lastName}`,
              officerRole: user.role
            }
          });
          console.log(`In-app notification created for ${user.firstName} ${user.lastName}`);

          /****** Sending email if user has email ******/
          if (user.email) {
            const result = await sendRoutingNotification(
              user.email,
              document,
              finalDepartment,
              routedBy
            );
            if (result.success) {
              console.log(`Email sent to ${user.firstName} ${user.lastName} (${user.role})`);
            } else {
              console.error(`Failed to send email to ${user.email}:`, result.error);
            }
          }
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError.message);
      }
    }

    /****** Log audit ******/
    await AuditLog.create({
      action: 'ROUTING_CONFIRMED',
      performedBy: req.user.userId,
      targetDocument: document._id,
      details: `Routing confirmed: ${finalDepartment?.name || 'Unknown'}`,
      metadata: { 
        aiSuggested: document.suggestedDepartment,
        finalDepartment: finalDepartment?.name,
        modified: !!modifiedDepartment
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    /****** Populating the references ******/
    await document.populate(['uploadedBy', 'assignedTo', 'department', 'routingConfirmedBy']);

    res.json({
      success: true,
      message: 'Routing confirmed successfully',
      data: document
    });

  } catch (error) {
    console.error('Confirm routing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Endpoitn to Verify document on blockchain ******/
router.get('/:id/verify', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const documentId = `PRAVAAH-${document._id.toString().slice(-8).toUpperCase()}`;
    const verification = await blockchainService.verifyDocument(documentId);

    res.json({
      success: true,
      data: {
        verified: verification.verified,
        documentId: documentId,
        blockchainTxHash: document.blockchainTxHash,
        actionCount: verification.actionCount || 0,
        latestAction: verification.latestAction,
        polygonScanUrl: document.blockchainTxHash 
          ? `https://amoy.polygonscan.com/tx/${document.blockchainTxHash}`
          : null
      }
    });

  } catch (error) {
    console.error('Blockchain verification error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

/****** Soft delete document for SUPER ADMIN only ******/
router.delete('/:id', authMiddleware, roleMiddleware('SUPER_ADMIN'), async (req, res) => {
  try {
    const { reason } = req.body;
    
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (document.isDeleted) {
      return res.status(400).json({ success: false, message: 'Document is already deleted' });
    }

    /****** Soft delete - mark as deleted but file will remain in disk ******/
    document.isDeleted = true;
    document.deletedAt = new Date();
    document.deletedBy = req.user.userId;
    document.deleteReason = reason || 'No reason provided';
    await document.save();

    /****** Log audit ******/
    await AuditLog.create({
      action: 'DOCUMENT_DELETE',
      performedBy: req.user.userId,
      targetDocument: document._id,
      details: `Soft deleted document: ${document.title} (Reason: ${reason || 'Not specified'})`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ 
      success: true, 
      message: 'Document deleted successfully (soft delete - can be restored)',
      data: { 
        id: document._id, 
        deletedAt: document.deletedAt,
        canRestore: true 
      }
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Restore deleted document for super admin only ******/
router.post('/:id/restore', authMiddleware, roleMiddleware('SUPER_ADMIN'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (!document.isDeleted) {
      return res.status(400).json({ success: false, message: 'Document is not deleted' });
    }

    /****** Restore document ******/
    document.isDeleted = false;
    document.deletedAt = null;
    document.deletedBy = null;
    document.deleteReason = null;
    await document.save();

    /****** Log restoration ******/
    await AuditLog.create({
      action: 'DOCUMENT_RESTORE',
      performedBy: req.user.userId,
      targetDocument: document._id,
      details: `Restored document: ${document.title}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ 
      success: true, 
      message: 'Document restored successfully',
      data: document
    });
  } catch (error) {
    console.error('Restore document error:', error);
    res.status(500).json({ success: false, message: 'Failed to restore document', error: error.message });
  }
});

// /****** Permanent delete for super admin only ******/
router.delete('/:id/permanent', authMiddleware, roleMiddleware('SUPER_ADMIN'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (!document.isDeleted) {
      return res.status(400).json({ 
        success: false, 
        message: 'Document must be soft deleted first before permanent deletion' 
      });
    }

    /****** Deleting file from filesystem ******/
    if (fs.existsSync(document.fileUrl)) {
      fs.unlinkSync(document.fileUrl);
    }

    /****** Permanent deletion from database ******/
    await Document.findByIdAndDelete(req.params.id);

    /****** Log permanent deletion ******/
    await AuditLog.create({
      action: 'DOCUMENT_PERMANENT_DELETE',
      performedBy: req.user.userId,
      targetDocument: req.params.id,
      details: `Permanently deleted document: ${document.title}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, message: 'Document permanently deleted from system' });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to permanently delete document', error: error.message });
  }
});

/****** Get document statistics for dashboard ******/
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const query = {};

    /****** Role-based filtering ******/
    if (req.user.role === 'OFFICER' || req.user.role === 'DEPARTMENT_ADMIN') {
      query.$or = [
        { uploadedBy: req.user.userId },
        { assignedTo: req.user.userId },
        { department: req.user.department }
      ];
    }

    const [total, pending, inProgress, approved, rejected] = await Promise.all([
      Document.countDocuments(query),
      Document.countDocuments({ ...query, status: 'Pending' }),
      Document.countDocuments({ ...query, status: 'In_Progress' }),
      Document.countDocuments({ ...query, status: 'Approved' }),
      Document.countDocuments({ ...query, status: 'Rejected' })
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        approved,
        rejected
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/****** Download/Preview document file serve as public endpoint ******/
router.get('/:id/download', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // /****** Sending file for preview or download ******
    const filePath = path.join(__dirname, '..', document.fileUrl);
    
    /****** Setting up proper headers for PDF preview ******/
    if (document.fileType === 'application/pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
    
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('File send error:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Failed to load file' });
        }
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
