const axios = require('axios');

const API_URL = 'http://localhost:5001';
const ADMIN_EMAIL = 'admin@pravah.gov.in';
const ADMIN_PASSWORD = 'Admin@2025';

async function resetDepartmentsViaMongoDB() {
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
    
    // Use MongoDB aggregation to update directly
    const mongoose = require('mongoose');
    require('dotenv').config({ path: require('path').join(__dirname, '.env') });
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pravah_prototype';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('🔄 Resetting all departments to Pending...\n');
    
    const result = await mongoose.connection.db.collection('departments').updateMany(
      {},
      {
        $set: {
          status: 'Pending',
          isActive: false
        },
        $unset: {
          approvedBy: "",
          approvedAt: "",
          rejectionReason: ""
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} departments`);
    console.log(`\n📊 Summary:`);
    console.log(`   All departments reset to: Pending`);
    console.log(`   isActive: false`);
    console.log(`   Cleared: approvedBy, approvedAt, rejectionReason`);
    console.log(`\n✅ Done! Refresh the page to see Pending (5) instead of Approved (5)`);
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetDepartmentsViaMongoDB();
