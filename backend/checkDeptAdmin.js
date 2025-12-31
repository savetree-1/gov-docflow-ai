const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');

mongoose.connect('mongodb://localhost:27017/krishi-sadhan', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB\n');
  
  // Finding the department admin
  const deptAdmin = await User.findOne({ role: 'DEPARTMENT_ADMIN' }).populate('department');
  
  if (!deptAdmin) {
    console.log('No Department Admin found!');
    mongoose.connection.close();
    return;
  }
  
  console.log('   Department Admin:');
  console.log('   Name:', deptAdmin.firstName, deptAdmin.lastName);
  console.log('   Email:', deptAdmin.email);
  console.log('   Department:', deptAdmin.department?.name || '❌ NOT ASSIGNED');
  console.log('   Department ID:', deptAdmin.department?._id || 'null');
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Find all users in that department
  if (deptAdmin.department) {
    const deptUsers = await User.find({ department: deptAdmin.department._id })
      .select('firstName lastName email role isApproved')
      .lean();
    
    console.log(` Users in ${deptAdmin.department.name} department:`);
    console.log(`   Total: ${deptUsers.length}\n`);
    
    if (deptUsers.length === 0) {
      console.log('    No users found in this department!');
      console.log('    The Department Admin can only see users from their own department.');
    } else {
      deptUsers.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.firstName} ${u.lastName} (${u.role}) - ${u.isApproved ? '✅ Approved' : '⏳ Pending'}`);
        console.log(`      Email: ${u.email}`);
      });
    }
  } else {
    console.log(' Department Admin has NO department assigned!');
    console.log(' This is why no users are showing.');
    console.log('\n To fix: Assign a department to this admin user.');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Show all departments
  const allDepts = await Department.find({ status: 'Approved' }).select('name code');
  console.log(' All Available Departments:');
  allDepts.forEach((d, i) => {
    console.log(`   ${i + 1}. ${d.name} (${d.code})`);
  });
  
  mongoose.connection.close();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
