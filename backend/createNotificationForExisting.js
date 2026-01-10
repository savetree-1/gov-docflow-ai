/*******Module which will create notification for existing routed documents and Runs this once to create notifications for documents routed before notification code was added ******/

const mongoose = require('mongoose');
require('dotenv').config();

const Document = require('./models/Document');
const User = require('./models/User');
const Notification = require('./models/Notification');
const Department = require('./models/Department');
const { sendRoutingNotification } = require('./services/emailService');

async function createNotificationForExisting() {
  try {
    /****** Connecting to MongoDB ******/
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/krishi-sadhan');
    console.log('MongoDB Connected');

    /****** Finding the "Agro Bulletci" document ******/
    const document = await Document.findOne({ title: /Agro Bulletci/i })
      .populate('department')
      .populate('uploadedBy');

    if (!document) {
      console.log('Document not found');
      process.exit(1);
    }

    console.log('\n Found Document:');
    console.log(`Title: ${document.title}`);
    console.log(`Department: ${document.department?.name}`);
    console.log(`Status: ${document.status}`);

    if (!document.department) {
      console.log('Document not routed to any department');
      process.exit(1);
    }

    /****** Geting all users in the department ******/
    const departmentUsers = await User.find({
      department: document.department._id,
      isActive: true,
      role: { $in: ['DEPARTMENT_ADMIN', 'OFFICER'] }
    }).select('_id email firstName lastName role');

    console.log(`\nFound ${departmentUsers.length} users in ${document.department.name}:`);
    departmentUsers.forEach(u => {
      console.log(`   - ${u.firstName} ${u.lastName} (${u.role}) - ${u.email}`);
    });

    const routedBy = document.uploadedBy 
      ? `${document.uploadedBy.firstName} ${document.uploadedBy.lastName}`
      : 'System';

    /****** Creating the notifications and send emails ******/
    console.log('\n Creating notifications and sending emails...\n');

    for (const user of departmentUsers) {
      /****** Creating in-app notification ******/
      const notification = await Notification.create({
        user: user._id,
        type: 'document_routed',
        title: 'New Document Routed to Your Department',
        message: `Document "${document.title}" has been routed to ${document.department.name}`,
        documentId: document._id,
        priority: document.urgency === 'High' ? 'high' : document.urgency === 'Medium' ? 'medium' : 'low'
      });

      console.log(` In-app notification created for ${user.firstName} ${user.lastName}`);

      /****** Sending email to user for the routed document ******/
      if (user.email) {
        try {
          const result = await sendRoutingNotification(
            user.email,
            document,
            document.department,
            routedBy
          );
          
          if (result.success) {
            console.log(`Email sent to ${user.email}`);
          } else {
            console.log(`Email failed for ${user.email}: ${result.error}`);
          }
        } catch (emailError) {
          console.error(`Email error for ${user.email}:`, emailError.message);
        }
      }
    }

    console.log('\n All notifications created and emails sent!');
    console.log('\n Summary:');
    console.log(`Document: ${document.title}`);
    console.log(`Department: ${document.department.name}`);
    console.log(`Users notified: ${departmentUsers.length}`);
    console.log(`Notifications created: ${departmentUsers.length}`);
    console.log(`Emails sent: ${departmentUsers.filter(u => u.email).length}`);

    process.exit(0);

  } catch (error) {
    console.error(' Error:', error);
    process.exit(1);
  }
}

/****** Runing the function for creating notifications ******/
createNotificationForExisting();
