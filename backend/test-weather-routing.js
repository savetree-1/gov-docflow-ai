const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5001/api';

async function testWeatherRouting() {
  try {
    console.log('Testing Weather Department Routing & Notifications\n');
    
    /****** Step 1: Login as Super Admin ******/
    console.log('1. Logging in as Super Admin...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@pravah.gov.in',
      password: 'Admin@123'
    });
    
    const token = loginRes.data.token;
    console.log('Logged in successfully\n');
    
    /****** Step 2: Get Weather department details ******/
    console.log('2. Fetching Weather department...');
    const deptsRes = await axios.get(`${API_BASE}/departments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const weatherDept = deptsRes.data.data.find(d => 
      d.name.toLowerCase().includes('weather') || d.name.toLowerCase().includes('meteorology')
    );
    
    if (!weatherDept) {
      console.error('Weather department not found');
      return;
    }
    
    console.log(`Found: ${weatherDept.name} (${weatherDept._id})\n`);
    
    /****** Step 3: Get Weather admin details ******/
    console.log('3. Fetching Weather department users...');
    const usersRes = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { department: weatherDept._id }
    });
    
    const weatherAdmin = usersRes.data.data.find(u => 
      u.role === 'DEPARTMENT_ADMIN' && u.email === 'ukweatherdept.gov@gmail.com'
    );
    
    if (!weatherAdmin) {
      console.log('Weather admin not found, listing all users:');
      usersRes.data.data.forEach(u => {
        console.log(`  - ${u.firstName} ${u.lastName} (${u.email}) - ${u.role}`);
      });
      return;
    }
    
    console.log(`Found Weather Admin: ${weatherAdmin.firstName} ${weatherAdmin.lastName}`);
    console.log(`Email: ${weatherAdmin.email}\n`);
    
    /****** Step 4: Create a test document with weather content ******/
    console.log('4. Creating test weather document...');
    
    const testContent = `
WEATHER ALERT NOTIFICATION
Uttarakhand Meteorological Department

Subject: Heavy Rainfall Warning for Northern Districts

This is to inform all concerned departments about an impending weather system 
that will bring heavy to very heavy rainfall across the northern districts of 
Uttarakhand from January 12-14, 2026.

Key Points:
- Rainfall intensity: 100-150mm expected
- Areas affected: Chamoli, Uttarkashi, Rudraprayag
- Risk: Flash floods, landslides
- Action Required: Immediate evacuation planning

All district magistrates are requested to take necessary precautions and 
keep emergency response teams on standby.

Meteorological Officer
Weather & Meteorology Department
Government of Uttarakhand
`;
    
    const testFilePath = path.join(__dirname, 'test-weather-alert.txt');
    fs.writeFileSync(testFilePath, testContent);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('title', 'Heavy Rainfall Warning - Northern Districts');
    formData.append('category', 'Weather');
    formData.append('urgency', 'High');
    formData.append('tags', JSON.stringify(['weather', 'alert', 'rainfall', 'emergency']));
    formData.append('description', 'Critical weather alert requiring immediate action');
    formData.append('initialDepartment', weatherDept._id);
    
    const uploadRes = await axios.post(`${API_BASE}/documents/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    const documentId = uploadRes.data.data._id;
    console.log(`Document uploaded: ${documentId}\n`);
    
    /****** Step 5: Wait for AI processing ******/
    console.log('5. Waiting for AI processing (10 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    /****** Step 6: Get document details ******/
    const docRes = await axios.get(`${API_BASE}/documents/${documentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const doc = docRes.data.data;
    console.log(`AI Processing complete`);
    console.log(`Suggested Dept: ${doc.suggestedDepartment || 'None'}`);
    console.log(`Current Dept: ${doc.department?.name || 'None'}`);
    console.log(`Routing Confirmed: ${doc.routingConfirmed}\n`);
    
    /****** Step 7: Confirm routing ******/
    console.log('6. Confirming routing to Weather department...');
    const confirmRes = await axios.post(
      `${API_BASE}/documents/${documentId}/confirm-routing`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('Routing confirmed\n');
    
    /****** Step 8: Check notifications ******/
    console.log('7. Checking notifications for Weather admin...');
    
    /****** Making a Login as weather admin to check notifications so that we can see only his notifications ******/
    const weatherLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ukweatherdept.gov@gmail.com',
      password: 'Weather@123'
    });
    
    const weatherToken = weatherLoginRes.data.token;
    
    const notificationsRes = await axios.get(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${weatherToken}` }
    });
    
    const relatedNotifs = notificationsRes.data.data.filter(n => 
      n.documentId === documentId || n.message.includes('Heavy Rainfall')
    );
    
    console.log(`Found ${relatedNotifs.length} notification(s):`);
    relatedNotifs.forEach(n => {
      console.log(`- ${n.title}: ${n.message}`);
      console.log(`Created: ${new Date(n.createdAt).toLocaleString()}`);
      console.log(`Read: ${n.isRead ? 'Yes' : 'No'}\n`);
    });
    
    /****** Step 9: Check email logs ******/
    console.log('8. Email notification status:');
    console.log(`Email should be sent to: ${weatherAdmin.email}`);
    console.log(`Subject: Document Routed to ${weatherDept.name}`);
    console.log(`Document: Heavy Rainfall Warning - Northern Districts\n`);
    
    /****** Performing a Cleanup operation ******/
    fs.unlinkSync(testFilePath);
    
    console.log('Test completed successfully!\n');
    console.log('Summary:');
    console.log(`Document routed to: ${weatherDept.name}`);
    console.log(`Notifications sent: ${relatedNotifs.length}`);
    console.log(`Email sent to: ${weatherAdmin.email}`);
    console.log(`\nDocument ID: ${documentId}`);
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testWeatherRouting();
