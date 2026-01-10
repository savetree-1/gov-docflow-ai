const mongoose = require('mongoose');
const Department = require('./models/Department');
const User = require('./models/User');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Checking Finance Department and Users...\n');
  
  /****** Checking the Finance Department ******/
  const financeDept = await Department.findOne({ code: 'FIN' });
  console.log('FINANCE DEPARTMENT:');
  console.log('Name:', financeDept.name);
  console.log('Status:', financeDept.status);
  console.log('isActive:', financeDept.isActive);
  console.log('Department ID:', financeDept._id);
  
  /****** Checking the Finance Admin ******/
  const financeAdmin = await User.findOne({ email: 'finance.admin@pravah.gov.in' }).populate('department');
  console.log('\nFINANCE ADMIN USER:');
  console.log('Email:', financeAdmin.email);
  console.log('Role:', financeAdmin.role);
  console.log('isActive:', financeAdmin.isActive);
  console.log('isApproved:', financeAdmin.isApproved);
  console.log('Department ID:', financeAdmin.department?._id || 'none');
  console.log('Department Name:', financeAdmin.department?.name || 'none');
  
  /****** Checking up all Finance users ******/
  const financeUsers = await User.find({ department: financeDept._id });
  console.log('\nALL FINANCE USERS:');
  financeUsers.forEach(u => {
    console.log(`   - ${u.email} (Role: ${u.role})`);
    console.log(`isActive: ${u.isActive}, isApproved: ${u.isApproved}`);
  });
  
  console.log('\nDIAGNOSIS:');
  if (!financeAdmin.isActive && !financeAdmin.isApproved) {
    console.log('Finance admin is DEACTIVATED and PENDING APPROVAL');
    console.log('This is CORRECT - user cannot login until Super Admin approves the department');
    console.log('');
    console.log('SOLUTION: Login as Super Admin and approve Finance Department first!');
    console.log('\t1. Login as admin@pravah.gov.in / Admin@2025');
    console.log('\t2. Go to Dashboard → Department Registrations → Pending (5)');
    console.log('\t3. Click "Approve" on Finance Department');
    console.log('\t4. Then try logging in as finance.admin@pravah.gov.in');
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
