require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');

async function checkNotifications() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const financeAdmin = await User.findOne({ email: 'finance.admin@pravah.gov.in' });
    
    if (!financeAdmin) {
      console.log('Finance Admin not found');
      return;
    }

    console.log('Finance Admin:');
    console.log('ID:', financeAdmin._id.toString());
    console.log('Name:', financeAdmin.firstName, financeAdmin.lastName);
    console.log('Email:', financeAdmin.email);
    
    const notifications = await Notification.find({ user: financeAdmin._id });
    
    console.log('\nNotifications for Finance Admin:', notifications.length);
    
    if (notifications.length > 0) {
      notifications.forEach((n, i) => {
        console.log(`\n${i + 1}. ${n.title}`);
        console.log(`Type: ${n.type}`);
        console.log(`Read: ${n.read}`);
        console.log(`Priority: ${n.priority}`);
        console.log(`Created: ${n.createdAt}`);
      });
    } else {
      console.log('   No notifications found. Creating test notifications...\n');
      
      const testNotifications = [
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

      await Notification.insertMany(testNotifications);
      console.log('Created 3 test notifications!');
      console.log('Refresh the notifications page to see them.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkNotifications();
