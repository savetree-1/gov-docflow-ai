const mongoose = require('mongoose');
const Department = require('./models/Department');
const User = require('./models/User');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Checking Disaster Management Department...\n');
  
  // Check Disaster Department
  const disasterDept = await Department.findOne({ code: 'DM' });
  console.log('📋 DISASTER MANAGEMENT DEPARTMENT:');
  console.log('   Name:', disasterDept.name);
  console.log('   Status:', disasterDept.status);
  console.log('   isActive:', disasterDept.isActive);
  console.log('   Department ID:', disasterDept._id);
  
  // Check Disaster Admin
  const disasterAdmin = await User.findOne({ email: 'disaster.admin@pravah.gov.in' }).populate('department');
  console.log('\n👤 DISASTER ADMIN USER:');
  console.log('   Email:', disasterAdmin.email);
  console.log('   Role:', disasterAdmin.role);
  console.log('   isActive:', disasterAdmin.isActive);
  console.log('   isApproved:', disasterAdmin.isApproved);
  console.log('   Department ID:', disasterAdmin.department?._id || 'none');
  
  // Check all Disaster users
  const disasterUsers = await User.find({ department: disasterDept._id });
  console.log('\n👥 ALL DISASTER MANAGEMENT USERS:');
  disasterUsers.forEach(u => {
    console.log(`   - ${u.email} (${u.role})`);
    console.log(`     isActive: ${u.isActive}, isApproved: ${u.isApproved}`);
  });
  
  console.log('\n🔍 DIAGNOSIS:');
  if (disasterDept.status === 'Approved' && !disasterAdmin.isActive) {
    console.log('   ❌ Department is Approved but users are NOT activated!');
    console.log('   🔧 Fixing now...\n');
    
    const result = await User.updateMany(
      { department: disasterDept._id },
      { $set: { isApproved: true, isActive: true } }
    );
    
    console.log(`   ✅ Activated ${result.modifiedCount} Disaster Management users!`);
    console.log('\n   Now you can login as:');
    console.log('   - disaster.admin@pravah.gov.in / Disaster@123');
  } else if (disasterAdmin.isActive && disasterAdmin.isApproved) {
    console.log('   ✅ Disaster admin is already activated!');
    console.log('   📝 Try logging in: disaster.admin@pravah.gov.in / Disaster@123');
  } else if (disasterDept.status === 'Pending') {
    console.log('   ⚠️  Department is still PENDING - not approved yet!');
    console.log('   📝 Approve it from Super Admin dashboard first');
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
