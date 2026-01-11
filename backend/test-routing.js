require('dotenv').config();
const { suggestRouting } = require('./services/geminiService');

async function testRouting() {
  console.log('Testing Uttarakhand Government Document Routing...\n');
  
  const testDocument = `
  GOVERNMENT OF UTTARAKHAND
  DISASTER MANAGEMENT AUTHORITY
  
  Subject: Emergency Response Protocol for Landslide in Chamoli District
  Date: January 10, 2026
  
  Immediate action required for landslide incident at village Joshimath.
  Following resources needed:
  1. Emergency rescue teams
  2. Medical assistance
  3. Food and shelter for 150 families
  4. Budget allocation of Rs. 50 lakhs for relief operations
  
  Coordination required between multiple departments.
  Contact: Emergency Control Room - 1070
  `;

  try {
    console.log('Test Document:');
    console.log(testDocument.substring(0, 200) + '...\n');
    
    console.log('Calling suggestRouting...');
    const result = await suggestRouting(testDocument, {
      title: 'Emergency Response Protocol',
      category: 'Emergency'
    });
    
    console.log('Routing Result:');
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('\nAI Routing Analysis:');
      console.log('Suggested Department:', result.data.primaryDepartment);
      console.log('Confidence Level:', result.data.confidence);
      console.log('Reasoning:', result.data.reasoning);
      console.log('3-Point Summary:', result.data.summary);
    } else {
      console.log('Routing failed');
      console.log('Fallback data:', result.data);
    }
    
  } catch (error) {
    console.error('Test Failed:', error.message);
  }
  
  console.log('\nRouting Test Complete');
}

testRouting();