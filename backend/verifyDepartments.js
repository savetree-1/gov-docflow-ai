const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Department = require('./models/Department');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function verifyDepartments() {
  try {
    console.log('\nDepartment User Summary:\n');
    console.log('='.repeat(80));
    
    const departments = await Department.find({ isActive: true });
    
    for (const dept of departments) {
      const users = await User.find({ 
        department: dept._id,
        isActive: true 
      }).select('firstName lastName email role employeeId');
      
      console.log(`\n${dept.name} (${dept.code})`);
      console.log('-'.repeat(80));
      
      if (users.length === 0) {
        console.log('   No users assigned');
      } else {
        users.forEach(user => {
          console.log(`   ${user.role.padEnd(18)} | ${user.firstName} ${user.lastName.padEnd(15)} | ${user.email}`);
        });
      }
      console.log(`   Total: ${users.length} users`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\nVerification Complete!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyDepartments();
