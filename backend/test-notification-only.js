const mongoose = require('mongoose');
require('dotenv').config();

const Notification = require('./models/Notification');
const User = require('./models/User');
const { sendRoutingNotification } = require('./services/emailService');

async function testNotification() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pravah_prototype');
    console.log('Connected to MongoDB');

    /****** Finding the weather admin for notification ******/
    const weatherAdmin = await User.findOne({ email: 'ukweatherdept.gov@gmail.com' });
    
    if (!weatherAdmin) {
      console.log('Weather admin not found');
      process.exit(1);
    }

    console.log(`Found weather admin: ${weatherAdmin.firstName} ${weatherAdmin.lastName}`);

    /****** Creating test notification so that notification system is verified ******/
    const notification = await Notification.create({
      user: weatherAdmin._id,
      type: 'document_routed',
      title: 'TEST: Document Routed to Weather Department',
      message: 'This is a test notification for Weather & Meteorology Department',
      priority: 'high',
      actionUrl: '/documents',
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`Notification created: ${notification._id}`);

    // Send test email
    console.log('\nSending test email...');
    const mockDocument = {
      _id: 'TEST123',
      title: 'Heavy Rainfall Alert - Uttarakhand Region',
      category: 'Weather',
      urgency: 'High',
      toString: () => 'TEST123'
    };

    const mockDepartment = {
      name: 'Weather & Meteorology Department',
      code: 'WEA'
    };

    const emailResult = await sendRoutingNotification(
      weatherAdmin.email,
      mockDocument,
      mockDepartment,
      'Super Admin'
    );

    if (emailResult.success) {
      console.log(`Email sent to ${weatherAdmin.email}`);
    } else {
      console.log(`Email failed: ${emailResult.error}`);
    }

    console.log('\nTest completed! Check:');
    console.log(`1. In-app notification for user: ${weatherAdmin.email}`);
    console.log(`2. Email inbox: ${weatherAdmin.email}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testNotification();
