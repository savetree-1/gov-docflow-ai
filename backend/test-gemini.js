require('dotenv').config();
const { generateSummary } = require('./services/geminiService');

async function testGeminiService() {
  console.log('Testing Gemini Service...\n');
  
  const testDocument = `
  GOVERNMENT NOTICE
  
  Subject: Weather Warning - Heavy Rainfall Alert
  Date: August 22, 2024
  
  All India Impact Based Weather Warning Bulletin
  
  Weather Warnings for next 7 days:
  - Heavy to very heavy rainfall expected in Kerala, Karnataka
  - Thunderstorms likely in Maharashtra, Gujarat  
  - Flooding risk in low-lying areas
  - Public advised to stay indoors during peak hours
  - Emergency services on high alert
  
  Issued by: India Meteorological Department
  Contact: weather@imd.gov.in
  `;

  try {
    console.log('Test Document Preview:');
    console.log(testDocument.substring(0, 200) + '...\n');
    
    console.log('Calling generateSummary...');
    const result = await generateSummary(testDocument, {
      title: 'Weather Warning Notice',
      category: 'Weather Alert'
    });
    
    console.log('Result Structure:');
    console.log('Success:', result.success);
    console.log('Has Data:', !!result.data);
    
    if (result.success && result.data) {
      console.log('\nAI Summary Generated:');
      console.log('Summary:', result.data.summary);
      console.log('Key Points:', result.data.keyPoints);
      console.log('Urgency:', result.data.aiUrgency);
      console.log('Deadline:', result.data.aiDeadline);
      console.log('\nSummary Length:', result.data.summary?.length || 0, 'characters');
    } else {
      console.log('Failed to generate summary');
      console.log('Error:', result.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('Test Failed:', error.message);
    console.error('Stack:', error.stack);
  }
  
  console.log('\nTest Complete');
}

testGeminiService();