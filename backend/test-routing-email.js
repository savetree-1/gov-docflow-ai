require('dotenv').config();
const { sendRoutingNotification } = require('./services/emailService');

const testDocument = {
  _id: '69630d7465d87e0818202c39',
  title: 'District-wise Weather Forecast for Uttarakhand',
  category: 'Weather',
  urgency: 'High',
  summary: 'This official document provides a five-day district-wise weather forecast for Uttarakhand. It details precipitation intensity and distribution for 27 districts from January 9-13, 2020. Critical weather parameters including temperature ranges, wind patterns, and rainfall predictions are documented for administrative planning and disaster preparedness purposes.',
  keyPoints: [
    'Five-day weather forecast covering all 27 districts of Uttarakhand',
    'Precipitation intensity data for January 9-13, 2020',
    'Temperature ranges and wind pattern analysis',
    'Critical data for disaster management and agricultural planning'
  ]
};

const testDepartment = {
  name: 'Weather (Meteorology) Department',
  code: 'MET'
};

const routedBy = 'Disaster Admin';

async function sendTestEmail() {
  console.log('📧 Sending test routing notification email...\n');
  console.log('To: ukweatherdept.gov@gmail.com');
  console.log('Document:', testDocument.title);
  console.log('Department:', testDepartment.name);
  console.log('Routed By:', routedBy);
  console.log('\n' + '─'.repeat(60) + '\n');

  const result = await sendRoutingNotification(
    'ukweatherdept.gov@gmail.com',
    testDocument,
    testDepartment,
    routedBy
  );

  if (result.success) {
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('\n📬 Check ukweatherdept.gov@gmail.com inbox');
  } else {
    console.log('❌ Email failed:', result.error);
  }
}

sendTestEmail();
