const mongoose = require('mongoose');
require('dotenv').config();

const Document = require('./models/Document');

async function checkDocument() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const doc = await Document.findOne({ title: /Notice 4/i })
      .populate('department')
      .populate('initialDepartment');
    
    if (doc) {
      console.log('\n=== Notice 4 check ===');
      console.log('Has summary:', !!doc.summary);
      console.log('Summary length:', doc.summary?.length || 0);
      console.log('\n--- ROUTING INFO ---');
      console.log('department:', doc.department?.name || 'NOT SET');
      console.log('suggestedDepartment:', doc.suggestedDepartment || 'NOT SET');
      console.log('routingReason:', doc.routingReason || 'NOT SET');
      console.log('routingConfidence:', doc.routingConfidence || 'NOT SET');
      console.log('routingConfirmed:', doc.routingConfirmed);
      
      if (!doc.suggestedDepartment) {
        console.log('\nPROBLEM: No routing information was generated!');
        console.log('This document needs to be reprocessed with routing.');
      }
    } else {
      console.log('Document not found');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDocument();
