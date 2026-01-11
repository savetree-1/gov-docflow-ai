const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Department = require('./models/Department');
const Document = require('./models/Document');
const Notification = require('./models/Notification');
const { sendRoutingNotification } = require('./services/emailService');

async function testRoutingNotification() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pravah_prototype');
    console.log('✅ Connected to MongoDB\n');

    // Find Weather Department
    const weatherDept = await Department.findOne({ name: /weather.*meteorology/i });
    if (!weatherDept) {
      console.log('❌ Weather & Meteorology Department not found');
      process.exit(1);
    }
    console.log(`✅ Found Department: ${weatherDept.name} (${weatherDept.code})\n`);

    // Find users in Weather Department
    const weatherUsers = await User.find({
      department: weatherDept._id,
      isActive: true,
      role: { $in: ['DEPARTMENT_ADMIN', 'OFFICER'] }
    }).select('email firstName lastName role');

    console.log(`✅ Found ${weatherUsers.length} users in ${weatherDept.name}:`);
    weatherUsers.forEach(u => {
      console.log(`   - ${u.firstName} ${u.lastName} (${u.role}) - ${u.email}`);
    });
    console.log('');

    // Create a test document
    const testDoc = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Heavy Rainfall Warning - Test',
      documentNumber: 'TEST-' + Date.now(),
      category: 'Weather',
      urgency: 'High'
    };

    // Test notifications and emails
    console.log('📧 Testing notifications and emails...\n');
    
    for (const user of weatherUsers) {
      // Create in-app notification
      const notification = await Notification.create({
        user: user._id,
        type: 'document_routed',
        title: 'Test: New Document Routed to Your Department',
        message: `Test document "${testDoc.title}" has been routed to ${weatherDept.name}`,
        documentId: testDoc._id,
        priority: 'high',
        actionUrl: `/document/${testDoc._id}`,
        metadata: {
          documentNumber: testDoc.documentNumber,
          category: testDoc.category,
          urgency: testDoc.urgency,
          routedToDepartment: weatherDept.name
        }
      });
      console.log(`✅ In-app notification created for ${user.firstName} ${user.lastName}`);

      // Send email
      if (user.email) {
        const result = await sendRoutingNotification(
          user.email,
          testDoc,
          weatherDept,
          'System Test'
        );
        if (result.success) {
          console.log(`✅ Email sent to ${user.email}`);
        } else {
          console.log(`❌ Failed to send email to ${user.email}: ${result.error}`);
        }
      }
    }

    console.log('\n✅ Test completed successfully!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testRoutingNotification();
