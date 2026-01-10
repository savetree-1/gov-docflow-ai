const axios = require('axios');

const API_URL = 'http://localhost:5001';
const ADMIN_EMAIL = 'admin@pravah.gov.in';
const ADMIN_PASSWORD = 'Admin@2025';

async function disapproveDepartments() {
  try {
    console.log('🔐 Logging in as Super Admin...');
    
    // Login to get token
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful\n');
    
    // Get all departments
    console.log('📋 Fetching all departments...');
    const deptsResponse = await axios.get(`${API_URL}/api/departments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const departments = deptsResponse.data.data;
    console.log(`✅ Found ${departments.length} departments\n`);
    
    console.log(`🔄 Setting all departments to pending approval...\n`);
    
    // Disapprove each department
    let successCount = 0;
    let failCount = 0;
    
    for (const dept of departments) {
      try {
        // Use the reject endpoint to set to Pending, then clear rejection
        await axios.put(`${API_URL}/api/departments/${dept._id}/reject`, {
          rejectionReason: 'Reset for approval workflow'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Set to Pending: ${dept.name}`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed: ${dept.name} - ${error.response?.data?.message || error.message}`);
        failCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Successfully set to pending: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log(`\n✅ Done! Login as Super Admin to approve departments from Department Registrations page.`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

disapproveDepartments();
