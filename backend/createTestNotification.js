require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');

async function createTestNotification() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    /****** Finding the Finance Admin user ******/
    const financeAdmin = await User.findOne({ email: 'finance.admin@pravah.gov.in' });
    
    if (!financeAdmin) {
      console.log('Finance Admin not found');
      return;
    }

    /****** Creating test notifications ******/
    const notifications = [
      {
        user: financeAdmin._id,
        type: 'document_routed',
        title: 'Budget Document Routed to Finance Department',
        message: 'Annual Budget 2026 document has been routed to your department for review',
        priority: 'high',
        read: false,
        metadata: {
          documentNumber: 'DOC-2026-001',
          category: 'Budget',
          urgency: 'High',
          routedToDepartment: 'Finance Department',
          officerName: 'Finance Admin',
          officerRole: 'DEPARTMENT_ADMIN'
        }
      },
      {
        user: financeAdmin._id,
        type: 'document_assigned',
        title: 'New Document Assigned',
        message: 'Expense Report Q4 2025 has been assigned to you for processing',
        priority: 'normal',
        read: false,
        metadata: {
          documentNumber: 'DOC-2026-002',
          category: 'Expense Report',
          urgency: 'Medium'
        }
      },
      {
        user: financeAdmin._id,
        type: 'document_approved',
        title: 'Document Approved',
        message: 'Your submitted document "Quarterly Budget Review" has been approved',
        priority: 'low',
        read: false
      }
    ];

    await Notification.insertMany(notifications);
    
    console.log('Created 3 test notifications for Finance Admin');
    console.log('\nLogin Details:');
    console.log('Email: finance.admin@pravah.gov.in');
    console.log('Password: Password@123');
    console.log('\nAfter login, you should see a red badge with "3" on the notification bell icon!\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createTestNotification();
