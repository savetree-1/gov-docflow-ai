const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

async function disapproveAllUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pravah_prototype';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Update all users except Super Admin to be unapproved and inactive
    const result = await User.updateMany(
      { 
        role: { $ne: 'SUPER_ADMIN' }  // All users except Super Admin
      },
      { 
        $set: {
          isApproved: false,
          isActive: false
        }
      }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} users:`);
    console.log('   - Set isApproved: false');
    console.log('   - Set isActive: false');

    // Show counts
    const totalUsers = await User.countDocuments();
    const approvedUsers = await User.countDocuments({ isApproved: true });
    const activeUsers = await User.countDocuments({ isActive: true });
    const pendingUsers = await User.countDocuments({ isApproved: false });

    console.log(`\n📊 User Status Summary:`);
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Approved & Active: ${approvedUsers} (Super Admin only)`);
    console.log(`   Pending Approval: ${pendingUsers}`);

    // Show Super Admin details
    const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' }).select('email firstName lastName');
    console.log(`\n👤 Active Super Admin:`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Name: ${superAdmin.firstName} ${superAdmin.lastName}`);

    console.log('\n✅ All users except Super Admin are now pending approval!');
    console.log('   Login as Super Admin to approve users from User Management page.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

disapproveAllUsers();
