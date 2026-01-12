const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  
  console.log('Activating auditor accounts...\n');
  
  /****** Updating only AUDITOR role users for isApproved and isActive ******/
  const result = await User.updateMany(
    { role: 'AUDITOR' },
    { 
      $set: { 
        isApproved: true,
        isActive: true
      }
    }
  );
  
  /****** Listing out all auditors ******/
  console.log(`Activated ${result.modifiedCount} auditor accounts!\n`);
  const auditors = await User.find({ role: 'AUDITOR' }).select('email firstName lastName isApproved isActive');
  
  if (auditors.length === 0) {
    console.log('No auditor accounts found in database\n');
  } else {
    console.log('Auditor Status:\n');
    auditors.forEach(auditor => {
      console.log(`${auditor.firstName} ${auditor.lastName} (${auditor.email})`);
      console.log(`  Approved: ${auditor.isApproved ? '✅' : '❌'}`);
      console.log(`  Active: ${auditor.isActive ? '✅' : '❌'}\n`);
    });
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
