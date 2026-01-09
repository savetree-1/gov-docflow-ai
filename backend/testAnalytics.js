/**
 * Test Analytics API
 * Verify all analytics endpoints are working
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5001/api';

// Test credentials from environment variables
const testUser = {
  email: process.env.TEST_USER_EMAIL || 'finance.admin@pravah.gov.in',
  password: process.env.TEST_USER_PASSWORD || 'Finance@123'
};

// Warn if using default credentials
if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
  console.warn('⚠️  Using default test credentials. Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env for production testing.\n');
}

async function testAnalytics() {
  try {
    console.log('🧪 Testing Analytics API\n');

    // 1. Login
    console.log('1️⃣ Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, testUser);
    const token = loginRes.data.data.accessToken;
    console.log('✅ Login successful\n');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Test Dashboard Summary
    console.log('2️⃣ Testing Dashboard Summary...');
    const summaryRes = await axios.get(`${API_URL}/analytics/dashboard-summary`, config);
    console.log('✅ Dashboard Summary:');
    console.log(JSON.stringify(summaryRes.data.data, null, 2));
    console.log('');

    // 3. Test Documents Over Time
    console.log('3️⃣ Testing Documents Over Time (30 days)...');
    const docsOverTimeRes = await axios.get(`${API_URL}/analytics/documents-over-time?days=30`, config);
    console.log(`✅ Found ${docsOverTimeRes.data.data.length} data points`);
    console.log('Sample:', docsOverTimeRes.data.data.slice(0, 3));
    console.log('');

    // 4. Test Department Performance
    console.log('4️⃣ Testing Department Performance...');
    const deptPerfRes = await axios.get(`${API_URL}/analytics/department-performance`, config);
    console.log(`✅ Found ${deptPerfRes.data.data.length} departments with data`);
    console.log('Sample:', deptPerfRes.data.data.slice(0, 2));
    console.log('');

    // 5. Test Status Distribution
    console.log('5️⃣ Testing Status Distribution...');
    const statusDistRes = await axios.get(`${API_URL}/analytics/status-distribution`, config);
    console.log('✅ Status Distribution:');
    console.log(JSON.stringify(statusDistRes.data.data, null, 2));
    console.log('');

    // 6. Test Processing Trends
    console.log('6️⃣ Testing Processing Trends...');
    const processTrendsRes = await axios.get(`${API_URL}/analytics/processing-trends?days=30`, config);
    console.log(`✅ Found ${processTrendsRes.data.data.length} trend data points`);
    console.log('Sample:', processTrendsRes.data.data.slice(0, 3));
    console.log('');

    console.log('🎉 All analytics endpoints working!\n');
    console.log('📊 Ready to view analytics dashboard');
    console.log('   Go to: http://localhost:3000/admin/dashboard\n');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('Full error:', error);
  }
}

testAnalytics();
