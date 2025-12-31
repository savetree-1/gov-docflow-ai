require('dotenv').config();
const { extractText } = require('./services/ocrService');
const { generateSummary } = require('./services/aiService');

(async () => {
  console.log('Step 1: Extracting text from PDF...');
  const extraction = await extractText(
    '/Users/anks/Downloads/Pravah_Uttarakhand_UI_System_Description.pdf',
    'application/pdf'
  );
  console.log('Extracted', extraction.text.length, 'characters');
  
  console.log('\nStep 2: Generating AI summary...');
  const summary = await generateSummary(extraction.text, {
    title: 'Pravah System Description',
    category: 'Documentation'
  });
  
  console.log('AI Summary Generated!');
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
})().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
