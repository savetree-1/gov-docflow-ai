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

async function testFinanceQuery() {
  try {
    console.log('\nTesting Finance Department Query:\n');
    console.log('='.repeat(80));
    
    // Find Finance Department
    const financeDept = await Department.findOne({ code: 'FIN' });
    console.log('\nFinance Department:');
    console.log(`   ID: ${financeDept._id}`);
    console.log(`   Name: ${financeDept.name}`);
    console.log(`   Code: ${financeDept.code}`);
    
    // Find Finance Admin
    const financeAdmin = await User.findOne({ 
      email: 'finance.admin@pravah.gov.in' 
    });
    
    console.log('\n Finance Admin:');
    console.log(`   ID: ${financeAdmin._id}`);
    console.log(`   Email: ${financeAdmin.email}`);
    console.log(`   Role: ${financeAdmin.role}`);
    console.log(`   Department ID: ${financeAdmin.department}`);
    console.log(`   Match: ${financeAdmin.department?.toString() === financeDept._id.toString()}`);
    
    // Test the exact query from the API
    const query = { department: financeAdmin.department };
    console.log('\n API Query:');
    console.log(`   Query: ${JSON.stringify(query)}`);
    
    const users = await User.find(query)
      .select('-password')
      .populate('department', 'name code');
    
    console.log(`\n Results: ${users.length} users found`);
    console.log('\n' + '-'.repeat(80));
    
    if (users.length === 0) {
      console.log(' NO USERS FOUND - This is the problem!');
      
      // Let's find ALL users and see their departments
      console.log('\n Checking ALL users in database:');
      const allUsers = await User.find({}).select('email role department');
      for (const user of allUsers) {
        console.log(`   ${user.email.padEnd(40)} | ${user.role.padEnd(18)} | Dept: ${user.department}`);
      }
    } else {
      users.forEach(user => {
        console.log(`    ${user.firstName} ${user.lastName}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Employee ID: ${user.employeeId}`);
        console.log(`      Department: ${user.department?.name} (${user.department?.code})`);
        console.log();
      });
    }
    
    console.log('='.repeat(80));
    console.log('\n Test Complete!\n');
    
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error);
    process.exit(1);
  }
}

testFinanceQuery();
