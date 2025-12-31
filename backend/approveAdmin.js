const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  
  console.log('Approving only Super Admin...\n');
  
  // Approving only super admin
  const admin = await User.findOneAndUpdate(
    { role: 'SUPER_ADMIN' },
    { 
      $set: { 
        isApproved: true,
        isActive: true
      }
    },
    { new: true }
  );
  
  if (admin) {
    console.log(' Super Admin approved!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Status: Approved \n`);
  } else {
    console.log('❌ Super Admin not found!\n');
  }
  
  // Seting all other users to pending except super admin
  await User.updateMany(
    { role: { $ne: 'SUPER_ADMIN' } },
    { $set: { isApproved: false } }
  );
  
  console.log(' All other users set to pending approval');
  console.log(' Admin can now approve them from dashboard\n');
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
