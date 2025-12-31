const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  
  console.log(' Approving all users...\n');
  
  // Updating all users to be approved and active to use application
  const result = await User.updateMany(
    {},
    { 
      $set: { 
        isApproved: true,
        isActive: true
      }
    }
  );
  
  console.log(` Updated ${result.modifiedCount} users`);
  console.log(' All users are now approved and active!\n');
  
  // Listing out all users
  const users = await User.find({}).select('email role isApproved isActive');
  console.log('Current User Status:\n');
  users.forEach(user => {
    console.log(`${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Approved: ${user.isApproved ? '✅' : '❌'}`);
    console.log(`  Active: ${user.isActive ? '✅' : '❌'}\n`);
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
