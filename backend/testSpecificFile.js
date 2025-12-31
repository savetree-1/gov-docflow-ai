require('dotenv').config();
const {extractText} = require('./services/ocrService');
const {generateSummary} = require('./services/aiService');

(async () => {
  const filePath = '/Users/anks/Downloads/Pravah_Uttarakhand_UI_System_Description.pdf';
  
  console.log('🔍 Testing AI processing on:', filePath, '\n');
  
  // Step 1: Extract text
  console.log('📄 Extracting text from PDF...');
  const result = await extractText(filePath, 'application/pdf');
  
  if (!result.success || !result.text) {
    console.log('❌ Failed to extract text');
    console.log('Error:', result.error);
    process.exit(1);
  }
  
  console.log('✅ Text extracted:', result.text.length, 'characters');
  console.log('Preview:', result.text.substring(0, 300), '...\n');
  
  // Step 2: Generate AI summary
  console.log('🤖 Generating AI summary with Gemini...\n');
  const aiResult = await generateSummary(result.text, {
    title: 'Pravah UI System',
    category: 'policy'
  });
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('📝 AI-GENERATED SUMMARY:');
  console.log('═══════════════════════════════════════════════════════');
  console.log(aiResult.summary);  console.log('\n' + '─'.repeat(55));
  console.log('📄 DOCUMENT EXCERPT (First 500 chars):');
  console.log('─'.repeat(55));
  console.log(result.text.substring(0, 500));
  console.log('...\n');  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔑 KEY POINTS:');
  console.log('═══════════════════════════════════════════════════════');
  aiResult.keyPoints.forEach((point, i) => {
    console.log(`${i+1}. ${point}`);
  });
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 METADATA:');
  console.log('═══════════════════════════════════════════════════════');
  console.log('⚡ Priority:', aiResult.priority);
  console.log('📅 Deadlines:', aiResult.deadlines?.join(', ') || 'None');
  console.log('📋 Action Items:', aiResult.actionItems?.length || 0);
  
  console.log('\n✅ AI processing completed successfully!\n');
  
})().catch(err => {
  console.error('❌ Error:', err.message);
  console.error(err);
  process.exit(1);
});
