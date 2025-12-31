require('dotenv').config({path: require('path').join(__dirname, '.env')});
const mongoose = require('mongoose');
const Document = require('./models/Document');
const { generateSummary } = require('./services/aiService');
const { extractText } = require('./services/ocrService');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const docId = '6952c6ec9a3bb9360abb4487';
    const doc = await Document.findById(docId);
    
    if (!doc) {
      console.log('Document not found');
      process.exit(1);
    }
    
    console.log('Document:', doc.title);
    console.log('File path:', doc.fileUrl);
    
    // Extracting the text from document
    console.log('Extracting text from document...');
    const extraction = await extractText(doc.fileUrl, doc.fileType);
    console.log('Extracted', extraction.text.length, 'characters');
    
    // Generating the AI summary off the extracted text
    console.log('Generating AI summary...');
    const summary = await generateSummary(extraction.text, {
      title: doc.title,
      category: doc.category
    });
    
    console.log('AI Summary generated!');
    
    // Saving the summary to DB
    doc.summary = summary.summary;
    doc.keyPoints = summary.keyPoints;
    doc.urgency = summary.priority || doc.urgency;
    doc.actionItems = summary.actionItems || [];
    await doc.save();
    
    console.log('Saved to database!');
    console.log('\nSummary:', summary.summary);
    console.log('\nKey Points:', summary.keyPoints);
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
