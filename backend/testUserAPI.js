const axios = require('axios');

async function testUserAPI() {
  try {
    console.log('\n🔍 Testing User API Endpoint:\n');
    console.log('='.repeat(80));
    
    // First, login as Finance Admin
    console.log('Step 1: Login as Finance Admin...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'finance.admin@pravah.gov.in',
      password: 'Finance@123'
    });
    
    const accessToken = loginResponse.data.data.accessToken;
    console.log(`✅ Login successful! Token: ${accessToken.substring(0, 20)}...`);
    
    // Now fetch users with the token
    console.log('\nStep 2: Fetching users with token...');
    const usersResponse = await axios.get('http://localhost:5001/api/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log(`✅ Users API Response:`);
    console.log(`   Status: ${usersResponse.status}`);
    console.log(`   Success: ${usersResponse.data.success}`);
    console.log(`   Total Users: ${usersResponse.data.data.length}`);
    console.log(`   Pagination: ${JSON.stringify(usersResponse.data.pagination)}`);
    
    console.log('\n📋 Users List:');
    console.log('-'.repeat(80));
    usersResponse.data.data.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Employee ID: ${user.employeeId}`);
      console.log(`   Department: ${user.department?.name || 'N/A'}`);
      console.log();
    });
    
    console.log('='.repeat(80));
    console.log('\n✅ API Test Complete!\n');
    
  } catch (error) {
    console.error('\n❌ API Test Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
      console.error('Status:', error.response.status);
    } else {
      console.error('Error:', error.message);
      console.error('Full error:', error);
    }
  }
}

testUserAPI();
