const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Department = require('./models/Department');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' MongoDB Connected'))
  .catch(err => {
    console.error(' MongoDB connection error:', err);
    process.exit(1);
  });

async function checkFinanceAdmin() {
  try {
    console.log('\nChecking Finance Admin Setup:\n');
    console.log('='.repeat(80));
    
    /****** Finding out the Finance Department ******/
    const financeDept = await Department.findOne({ code: 'FIN' });
    console.log('\n Finance Department:');
    console.log(JSON.stringify(financeDept, null, 2));
    
    /****** Finding out the Finance Admin User ******/
    const financeAdmin = await User.findOne({ 
      email: 'finance.admin@pravah.gov.in' 
    }).populate('department');
    
    console.log('\n Finance Admin User:');
    console.log(JSON.stringify({
      _id: financeAdmin?._id,
      email: financeAdmin?.email,
      role: financeAdmin?.role,
      department: financeAdmin?.department,
      departmentMatches: financeAdmin?.department?._id.toString() === financeDept?._id.toString()
    }, null, 2));
    
    /****** Finding all users in Finance Department ******/
    const financeUsers = await User.find({ 
      department: financeDept?._id 
    }).select('firstName lastName email role employeeId department');
    
    console.log('\n All Finance Department Users:');
    financeUsers.forEach(user => {
      console.log(`${user.role.padEnd(18)} | ${user.firstName} ${user.lastName.padEnd(15)} | ${user.email}`);
    });
    console.log(`\nTotal: ${financeUsers.length} users`);
    
    /****** Testing the query that the API would run ******/
    const query = { department: financeAdmin?.department?._id };
    const apiResult = await User.find(query)
      .select('-password')
      .populate('department', 'name code');
    
    console.log('\n API Query Test (what Department Admin should see):');
    console.log(`   Query: ${JSON.stringify(query)}`);
    console.log(`   Results: ${apiResult.length} users`);
    apiResult.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });
    
    console.log('\n' + '*'.repeat(80));
    console.log('\n Check Complete!\n');
    
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error);
    process.exit(1);
  }
}

checkFinanceAdmin();
