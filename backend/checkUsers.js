require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).select('firstName lastName email role department');
    
    console.log('📋 Available Test Users:\n');
    console.log('═══════════════════════════════════════════════════════════════');
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      if (user.department) {
        console.log(`   Department: ${user.department}`);
      }
    });
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('\n💡 To test notifications, login with any DEPARTMENT_ADMIN or OFFICER account');
    console.log('   The notification bell icon should appear in the header next to the profile.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();
