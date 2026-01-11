const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  
  console.log('🔍 Activating auditor accounts...\n');
  
  // Update only AUDITOR role users
  const result = await User.updateMany(
    { role: 'AUDITOR' },
    { 
      $set: { 
        isApproved: true,
        isActive: true
      }
    }
  );
  
  console.log(`✅ Updated ${result.modifiedCount} auditor(s)\n`);
  
  // List all auditors
  const auditors = await User.find({ role: 'AUDITOR' }).select('email firstName lastName isApproved isActive');
  
  if (auditors.length === 0) {
    console.log('⚠️  No auditor accounts found in database\n');
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
