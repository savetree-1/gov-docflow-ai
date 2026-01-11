require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');

async function checkNotifications() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected\n');

    /****** Finding Weather admin ******/
    const weatherAdmin = await User.findOne({ 
      email: 'ukweatherdept.gov@gmail.com' 
    });
    
    if (!weatherAdmin) {
      console.log('Weather admin not found');
      return;
    }

    console.log('Weather Admin:', weatherAdmin.firstName, weatherAdmin.lastName);
    console.log('User ID:', weatherAdmin._id);
    console.log('Email:', weatherAdmin.email);
    console.log('\nRecent Notifications:');
    console.log('*'.repeat(60));

    const notifications = await Notification.find({
      user: weatherAdmin._id
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('relatedUserId', 'firstName lastName');

    if (notifications.length === 0) {
      console.log('No notifications found');
    } else {
      notifications.forEach((n, i) => {
        console.log(`\n${i + 1}. ${n.title}`);
        console.log(`Type: ${n.type}`);
        console.log(`Message: ${n.message}`);
        console.log(`Read: ${n.isRead ? 'Yes' : 'No'}`);
        console.log(`Created: ${n.createdAt}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkNotifications();
