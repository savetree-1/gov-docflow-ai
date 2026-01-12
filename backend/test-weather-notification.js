const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Department = require('./models/Department');
const Notification = require('./models/Notification');
const { sendRoutingNotification } = require('./services/emailService');

async function testWeatherNotification() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pravah_prototype');
    console.log('Connected to MongoDB\n');

    /****** Finding Weather/Meteorology department so that admin can be fetched ******/
    const weatherDept = await Department.findOne({ 
      name: { $regex: /weather|meteorology/i } 
    });
    
    if (!weatherDept) {
      console.log('Weather/Meteorology department not found');
      process.exit(1);
    }
    
    console.log('Found Department:', weatherDept.name, '(ID:', weatherDept._id, ')\n');

    /****** Finding Weather admin for notification testing ******/
    const weatherAdmin = await User.findOne({ 
      department: weatherDept._id,
      role: 'DEPARTMENT_ADMIN'
    }).populate('department');
    
    if (!weatherAdmin) {
      console.log('Weather admin not found');
      process.exit(1);
    }
    
    console.log('Weather Admin:', {
      name: weatherAdmin.firstName + ' ' + weatherAdmin.lastName,
      email: weatherAdmin.email,
      role: weatherAdmin.role,
      department: weatherAdmin.department?.name
    });
    console.log('\n' + '='.repeat(60) + '\n');

    /****** Creating the test notification for Weather admin ******/
    console.log('Creating test notification...');
    const notification = new Notification({
      userId: weatherAdmin._id,
      message: 'TEST: Document routed to your department',
      type: 'document_forwarded',
      priority: 'normal', /****** Fixed from 'medium' ******/
      metadata: {
        documentId: 'TEST_DOC_ID',
        documentTitle: 'Test Document for Weather Department',
        from: 'Disaster Management',
        to: weatherDept.name
      }
    });
    
    await notification.save();
    console.log('Notification created successfully!\n');

    /****** Sending email to Weather admin ******/
    console.log('Sending email notification...');
    try {
      await sendRoutingNotification({
        to: weatherAdmin.email,
        documentTitle: 'Test Document for Weather Department',
        fromDepartment: 'Disaster Management',
        toDepartment: weatherDept.name,
        officerName: weatherAdmin.firstName + ' ' + weatherAdmin.lastName,
        documentId: 'TEST_DOC_ID'
      });
      console.log('Email sent successfully to:', weatherAdmin.email);
    } catch (emailErr) {
      console.log('Email error:', emailErr.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETED');
    console.log('Check:');
    console.log('1. In-app notifications for', weatherAdmin.email);
    console.log('2. Email inbox at', weatherAdmin.email);
    console.log('*'.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testWeatherNotification();
