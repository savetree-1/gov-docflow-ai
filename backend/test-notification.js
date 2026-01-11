const mongoose = require('mongoose');
require('dotenv').config();

const Notification = require('./models/Notification');
const User = require('./models/User');

async function testNotification() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pravah_prototype');
    console.log('Connected to MongoDB');

    // Find weather admin
    const weatherAdmin = await User.findOne({ email: 'ukweatherdept.gov@gmail.com' });
    
    if (!weatherAdmin) {
      console.log('❌ Weather admin not found');
      process.exit(1);
    }

    console.log(`✅ Found weather admin: ${weatherAdmin.firstName} ${weatherAdmin.lastName}`);
    console.log(`   Email: ${weatherAdmin.email}`);
    console.log(`   ID: ${weatherAdmin._id}`);

    // Create a test notification
    const notification = await Notification.create({
      user: weatherAdmin._id,
      type: 'document_routed',
      title: '🌧️ Test: New Weather Document Routed',
      message: 'Heavy Rainfall Alert document has been routed to Weather & Meteorology Department',
      priority: 'high',
      actionUrl: '/documents',
      metadata: {
        documentTitle: 'Heavy Rainfall Alert',
        category: 'Weather',
        urgency: 'High',
        routedBy: 'Super Admin'
      }
    });

    console.log('\n✅ Notification created successfully!');
    console.log(`   Notification ID: ${notification._id}`);
    console.log(`   Title: ${notification.title}`);
    console.log(`   Message: ${notification.message}`);
    console.log(`   Priority: ${notification.priority}`);
    
    // Check total notifications for this user
    const totalNotifications = await Notification.countDocuments({ user: weatherAdmin._id });
    const unreadNotifications = await Notification.countDocuments({ user: weatherAdmin._id, isRead: false });
    
    console.log(`\n📊 Notification Stats for ${weatherAdmin.email}:`);
    console.log(`   Total: ${totalNotifications}`);
    console.log(`   Unread: ${unreadNotifications}`);
    
    console.log('\n✅ Test completed! Check the UI for the notification.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testNotification();
