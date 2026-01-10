require('dotenv').config();
const path = require('path');
const { extractText } = require('./services/extractText');
const { analyzeDocumentText } = require('./services/aiService');

async function testPipeline() {
  console.log('TESTING COMPLETE PIPELINE\n');
  console.log('━'.repeat(60));
  
  /****** Testing file which will be replaced with actual path ******/
  const testFile = path.join(__dirname, 'uploads', 'documents', 'Pravah_Uttarakhand_UI_System_Description.pdf');
  const mimeType = 'application/pdf';
  
  try {
    /****** STEP 1: Text Extraction ******/
    console.log('\nSTEP 1: TEXT EXTRACTION');
    console.log('━'.repeat(60));
    const text = await extractText(testFile, mimeType);
    console.log(`Extracted ${text.length} characters`);
    console.log(`Preview: ${text.substring(0, 200)}...\n`);
    
    /****** STEP 2: AI Analysis ******/
    console.log('\nSTEP 2: AI ANALYSIS (GEMINI)');
    console.log('━'.repeat(60));
    const aiResult = await analyzeDocumentText(text, {
      title: 'Pravah System Document',
      category: 'Technical Specification'
    });
    
    console.log('\nRESULTS:');
    console.log('━'.repeat(60));
    console.log('\nSUMMARY:');
    console.log(aiResult.summary);
    console.log('\nKEY POINTS:');
    aiResult.keyPoints.forEach((point, idx) => {
      console.log(`${idx + 1}. ${point}`);
    });
    console.log('\nPRIORITY:', aiResult.priority);
    console.log('DOCUMENT TYPE:', aiResult.documentType);
    
    console.log('\n━'.repeat(60));
    console.log('PIPELINE TEST SUCCESSFUL!');
    console.log('━'.repeat(60));
    
  } catch (error) {
    console.error('\nTEST FAILED:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

testPipeline();
