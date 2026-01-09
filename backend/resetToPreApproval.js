const mongoose = require('mongoose');
const Department = require('./models/Department');
const User = require('./models/User');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB\n');
  
  console.log('🔄 Resetting all departments to pre-approval state...\n');
  
  // Reset all departments to Pending
  const deptResult = await Department.updateMany(
    {},
    { 
      $set: { 
        status: 'Pending',
        isActive: false,
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null
      } 
    }
  );
  
  console.log(`✅ Reset ${deptResult.modifiedCount} departments to Pending status\n`);
  
  // Deactivate all department users (admins and officers) but keep Super Admin and Auditors active
  const userResult = await User.updateMany(
    { 
      role: { $in: ['DEPARTMENT_ADMIN', 'OFFICER'] }
    },
    { 
      $set: { 
        isApproved: false,
        isActive: false
      } 
    }
  );
  
  console.log(`✅ Deactivated ${userResult.modifiedCount} department users (admins + officers)\n`);
  
  // Verify departments
  const departments = await Department.find().sort({ code: 1 });
  console.log('📋 All Departments (Pending):');
  departments.forEach(d => {
    console.log(`   ${d.code} - ${d.name}: ${d.status} (isActive: ${d.isActive})`);
  });
  
  console.log('\n👥 Active Users (Super Admin + Auditors only):');
  const activeUsers = await User.find({ isActive: true });
  activeUsers.forEach(u => {
    console.log(`   ✅ ${u.email} (${u.role})`);
  });
  
  console.log('\n🔒 Inactive Users (Need approval):');
  const inactiveUsers = await User.find({ isActive: false });
  inactiveUsers.forEach(u => {
    console.log(`   ❌ ${u.email} (${u.role}) - Department: ${u.department ? 'assigned' : 'none'}`);
  });
  
  console.log('\n✅ All departments reset to pre-approval state!');
  console.log('📝 Test workflow:');
  console.log('   1. Login as admin@pravah.gov.in / Admin@2025');
  console.log('   2. Go to Department Registrations → Pending (5)');
  console.log('   3. Approve Finance Department');
  console.log('   4. Logout and login as finance.admin@pravah.gov.in / Finance@123');
  console.log('   5. Should now work! ✅\n');
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
