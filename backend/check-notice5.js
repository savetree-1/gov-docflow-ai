require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');
const Department = require('./models/Department');
const User = require('./models/User');

async function checkNotice5() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected\n');

    const doc = await Document.findOne({ title: 'Notice 5' })
      .populate('department', 'name')
      .populate('uploadedBy', 'name email');
    
    if (!doc) {
      console.log('Document "Notice 5" not found');
      await mongoose.disconnect();
      return;
    }

    console.log('Document: Notice 5');
    console.log('*'.repeat(60));
    console.log('ID:', doc._id);
    console.log('Title:', doc.title);
    console.log('Category:', doc.category);
    console.log('Department:', doc.department?.name || doc.department);
    console.log('\nAI FIELDS:');
    console.log('─'.repeat(60));
    console.log('Has summary:', !!doc.summary);
    console.log('Summary:', doc.summary?.substring(0, 200) + '...');
    console.log('\nROUTING FIELDS (needed for buttons to show):');
    console.log('─'.repeat(60));
    console.log('suggestedDepartment:', doc.suggestedDepartment || 'MISSING');
    console.log('routingReason:', doc.routingReason || 'MISSING');
    console.log('routingConfidence:', doc.routingConfidence || 'MISSING');
    console.log('routingConfirmed:', doc.routingConfirmed);
    
    console.log('\nDIAGNOSIS:');
    console.log('*'.repeat(60));
    if (!doc.suggestedDepartment) {
      console.log('Document is missing routing fields!');
      console.log('This document was uploaded when Gemini API was quota-exhausted.');
      console.log('It has summary but no routing suggestion.');
      console.log('\nSOLUTION: Upload a NEW document to see routing buttons.');
      console.log('OR reprocess this document with working API key.');
    } else {
      console.log('Document has all routing fields - buttons should display!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkNotice5();
