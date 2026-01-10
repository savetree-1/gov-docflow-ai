const mongoose = require('mongoose');
require('dotenv').config();

const Document = require('./models/Document');
const Department = require('./models/Department');

async function checkRouting() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Get the latest document
    const doc = await Document.findOne({ title: /Weather Data/i })
      .populate('department')
      .populate('suggestedDepartment')
      .populate('initialDepartment');
    
    if (doc) {
      console.log('\n=== Document: Weather Data ===');
      console.log('Initial Department:', doc.initialDepartment?.name || 'Not set');
      console.log('Current Department:', doc.department?.name || 'Not set');
      console.log('Suggested Department:', doc.suggestedDepartment?.name || 'Not set');
      console.log('Routing Confirmed:', doc.routingConfirmed);
      console.log('AI Confidence:', doc.aiConfidence);
      console.log('AI Reasoning:', doc.aiReasoning?.substring(0, 100) || 'Not set');
      console.log('Has Summary:', !!doc.summary);
      console.log('Summary length:', doc.summary?.length || 0);
      console.log('\n✅ Gemini IS generating routing:', !!doc.suggestedDepartment);
    } else {
      console.log('❌ Document not found');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRouting();
