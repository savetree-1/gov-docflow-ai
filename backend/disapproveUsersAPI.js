const axios = require('axios');

const API_URL = 'http://localhost:5001';
const ADMIN_EMAIL = 'admin@pravah.gov.in';
const ADMIN_PASSWORD = 'Admin@2025';

async function disapproveAllUsers() {
  try {
    console.log('Logging in as Super Admin...');
    
    /****** Making a Login to get token ******/
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const token = loginResponse.data.data.accessToken;
    console.log('Login successful\n');
    
    /****** Taking all users ******/
    console.log('Fetching all users...');
    const usersResponse = await axios.get(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const users = usersResponse.data.data;  /****** Changed: data.data instead of data.data.users ******/
    console.log(`Found ${users.length} users\n`);
    
    /****** Filtering out Super Admin ******/
    const usersToDisapprove = users.filter(user => user.role !== 'SUPER_ADMIN');
    
    console.log(`Disapproving ${usersToDisapprove.length} users...\n`);
    
    /****** Disapproving each user ******/
    let successCount = 0;
    let failCount = 0;
    
    for (const user of usersToDisapprove) {
      try {
        await axios.put(`${API_URL}/api/users/${user._id}`, {
          isApproved: false,
          isActive: false
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`Disapproved: ${user.email} (${user.role})`);
        successCount++;
      } catch (error) {
        console.log(`Failed: ${user.email} - ${error.response?.data?.message || error.message}`);
        failCount++;
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`Successfully disapproved: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Super Admin (kept active): 1`);
    console.log(`\nDone! Login as Super Admin at http://localhost:3000 to approve users.`);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

disapproveAllUsers();
