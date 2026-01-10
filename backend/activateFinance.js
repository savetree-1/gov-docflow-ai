const mongoose = require('mongoose');
const Department = require('./models/Department');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB\n');
  
  /****** Taking Finance Department ******/
  const financeDept = await Department.findOne({ code: 'FIN' });
  console.log('Finance Department:', financeDept.name);
  console.log('Status:', financeDept.status);
  console.log('isActive:', financeDept.isActive);
  
  /****** Checking the Finance users ******/
  const financeUsers = await User.find({ department: financeDept._id });
  console.log('\nFinance Department Users BEFORE:');
  financeUsers.forEach(u => {
    console.log(`- ${u.email} (Role: ${u.role}) - isApproved: ${u.isApproved}, isActive: ${u.isActive}`);
  });
  
  /****** Approving the departments and activate users ******/
  financeDept.status = 'Approved';
  financeDept.isActive = true;
  await financeDept.save();
  
  const result = await User.updateMany(
    { department: financeDept._id },
    { $set: { isApproved: true, isActive: true } }
  );
  
  console.log(`\nFinance Department Approved!`);
  console.log(`Activated ${result.modifiedCount} users!\n`);
  
  /****** Verification after update ******/
  const updatedUsers = await User.find({ department: financeDept._id });
  console.log('Finance Users AFTER:');
  updatedUsers.forEach(u => {
    console.log(`- ${u.email} (Role: ${u.role}) - isApproved: ${u.isApproved}, isActive: ${u.isActive}`);
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
