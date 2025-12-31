require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');

async function checkDocument() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' Connected to MongoDB');
    
    const doc = await Document.findOne({ title: 'ghjhjhjjj' });
    
    if (!doc) {
      console.log(' Document not found');
      process.exit(1);
    }
    
    console.log('\n Document Details:');
    console.log('ID:', doc._id);
    console.log('Title:', doc.title);
    console.log('File Name:', doc.fileName);
    console.log('File Path:', doc.filePath);
    console.log('\n AI Fields:');
    console.log('Has summary field:', doc.summary !== undefined);
    console.log('Summary value:', doc.summary || 'NULL');
    console.log('Has keyPoints field:', doc.keyPoints !== undefined);
    console.log('KeyPoints:', doc.keyPoints);
    console.log('Has extractedText field:', doc.extractedText !== undefined);
    console.log('Extracted text length:', doc.extractedText ? doc.extractedText.length : 0);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDocument();
