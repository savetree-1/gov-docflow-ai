const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const financeDept = await Department.findOne({ code: 'FIN' });
  
  console.log('🔄 Activating Finance users to match approved department...\n');
  
  const result = await User.updateMany(
    { department: financeDept._id },
    { $set: { isApproved: true, isActive: true } }
  );
  
  console.log(`✅ Activated ${result.modifiedCount} Finance users!\n`);
  
  const users = await User.find({ department: financeDept._id });
  console.log('Finance Users:');
  users.forEach(u => {
    console.log(`   ✅ ${u.email} - isActive: ${u.isActive}, isApproved: ${u.isApproved}`);
  });
  
  console.log('\n✅ Finance admin can now login!');
  console.log('📝 Try: finance.admin@pravah.gov.in / Finance@123\n');
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
