const axios = require('axios');

async function testCompleteFlow() {
  console.log('\nTesting Complete User Flow\n');
  console.log('='.repeat(80));
  
  try {
    // Step 1: Login
    console.log('\n1️Logging in as Finance Admin...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'finance.admin@pravah.gov.in',
      password: 'Finance@123'
    });
    
    if (!loginResponse.data.success) {
      console.log('Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.accessToken;
    const user = loginResponse.data.data.user;
    
    console.log('   Login successful!');
    console.log(`   User: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Department: ${user.department?.name} (${user.department?.code})`);
    console.log(`   Department ID: ${user.department?._id}`);
    console.log(`   Token: ${token.substring(0, 50)}...`);
    
    // Step 2: Get Users
    console.log('\n2️Fetching users with this token...');
    const usersResponse = await axios.get('http://localhost:5001/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!usersResponse.data.success) {
      console.log('Failed to fetch users:', usersResponse.data.message);
      return;
    }
    
    const users = usersResponse.data.data;
    console.log(`Successfully fetched ${users.length} users!`);
    console.log('\n' + '-'.repeat(80));
    
    if (users.length === 0) {
      console.log('NO USERS RETURNED - This is the problem!');
      console.log('\nPossible reasons:');
      console.log('  1. Department filtering is excluding all users');
      console.log('  2. User department ID does not match any users');
      console.log('  3. Query filter issue in backend');
    } else {
      console.log('Users returned:');
      users.forEach(u => {
        console.log(`     ${u.firstName} ${u.lastName}`);
        console.log(`      Role: ${u.role}`);
        console.log(`      Email: ${u.email}`);
        console.log(`      Employee ID: ${u.employeeId}`);
        console.log(`      Department: ${u.department?.name || 'None'}`);
        console.log('');
      });
    }
    
    // Step 3: Check all users in database
    console.log('\n3️For comparison, fetching as Super Admin...');
    const superAdminLogin = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@pravah.gov.in',
      password: 'Admin@2025'
    });
    
    const superToken = superAdminLogin.data.data.accessToken;
    const allUsersResponse = await axios.get('http://localhost:5001/api/users', {
      headers: {
        'Authorization': `Bearer ${superToken}`
      }
    });
    
    console.log(`   Super Admin sees ${allUsersResponse.data.data.length} total users`);
    
    console.log('\n' + '='.repeat(80));
    console.log('Test Complete!\n');
    
  } catch (error) {
    console.error('\nError:', error.response?.data || error.message);
  }
}

testCompleteFlow();
