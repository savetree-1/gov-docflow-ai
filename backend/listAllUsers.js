const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const Document = require('./models/Document');
  const Department = require('./models/Department');
  
  console.log('=== ALL USERS IN SYSTEM ===\n');
  const users = await User.find({}).populate('department').select('email firstName lastName role department employeeId');
  
  const officers = [];
  const deptAdmins = [];
  const auditors = [];
  const superAdmins = [];
  
  users.forEach(user => {
    const userData = {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      employeeId: user.employeeId,
      department: user.department ? user.department.name : 'N/A'
    };
    
    if (user.role === 'OFFICER') officers.push(userData);
    else if (user.role === 'DEPARTMENT_ADMIN') deptAdmins.push(userData);
    else if (user.role === 'AUDITOR') auditors.push(userData);
    else if (user.role === 'SUPER_ADMIN') superAdmins.push(userData);
  });
  
  console.log('OFFICERS:', officers.length);
  officers.forEach(u => {
    console.log(`  - ${u.name} (${u.email})`);
    console.log(`    ID: ${u.employeeId} | Dept: ${u.department}`);
  });
  
  console.log('\nDEPARTMENT ADMINS:', deptAdmins.length);
  deptAdmins.forEach(u => {
    console.log(`  - ${u.name} (${u.email})`);
    console.log(`    ID: ${u.employeeId} | Dept: ${u.department}`);
  });
  
  console.log('\nAUDITORS:', auditors.length);
  auditors.forEach(u => {
    console.log(`  - ${u.name} (${u.email})`);
    console.log(`    ID: ${u.employeeId}`);
  });
  
  console.log('\nSUPER ADMINS:', superAdmins.length);
  superAdmins.forEach(u => {
    console.log(`  - ${u.name} (${u.email})`);
    console.log(`    ID: ${u.employeeId}`);
  });
  
  console.log('\n=== DOCUMENTS ===');
  const docs = await Document.find({})
    .populate('uploadedBy', 'firstName lastName')
    .populate('department', 'name')
    .select('title uploadedBy department status');
  
  console.log(`Total documents: ${docs.length}\n`);
  docs.forEach(doc => {
    const uploader = doc.uploadedBy ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}` : 'Unknown';
    const dept = doc.department ? doc.department.name : 'NOT ROUTED';
    console.log(`"${doc.title}"`);
    console.log(`  Uploaded by: ${uploader}`);
    console.log(`  Routed to: ${dept}`);
    console.log(`  Status: ${doc.status}`);
    console.log('');
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
