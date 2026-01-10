const mongoose = require('mongoose');
require('dotenv').config();

const Document = require('./models/Document');
const Department = require('./models/Department');
const { extractText } = require('./services/extractText');
const { suggestRouting } = require('./services/geminiService');

async function reprocessRouting() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Get all documents with files
    const docs = await Document.find({ fileUrl: { $exists: true, $ne: null } })
      .sort({ createdAt: -1 })
      .limit(3);
    
    console.log(`\n📄 Found ${docs.length} documents with files\n`);
    
    for (const doc of docs) {
      console.log(`\n📄 Processing: ${doc.title}`);
      console.log(`   File: ${doc.fileUrl}`);
      
      // Construct full file path
      const filePath = require('path').join(__dirname, doc.fileUrl);
      
      // Extract text from PDF (default to application/pdf if mimeType not set)
      const mimeType = doc.mimeType || 'application/pdf';
      const text = await extractText(filePath, mimeType);
      console.log(`   Extracted: ${text.length} characters`);
      
      // Get routing suggestion from Gemini
      console.log('   🤖 Calling Gemini for routing...');
      const routingResult = await suggestRouting(text, { 
        title: doc.title, 
        category: doc.category 
      });
      
      if (routingResult.success) {
        console.log(`   ✅ Suggested: ${routingResult.data.primaryDepartment} (${routingResult.data.confidence})`);
        
        // Find the suggested department
        const suggestedDept = await Department.findOne({
          name: new RegExp(routingResult.data.primaryDepartment, 'i')
        });
        
        if (suggestedDept) {
          // Update document with routing
          doc.department = suggestedDept._id;
          doc.suggestedDepartment = suggestedDept._id;
          doc.aiConfidence = routingResult.data.confidence;
          doc.aiReasoning = routingResult.data.reasoning;
          doc.routingConfirmed = false;
          
          await doc.save();
          
          console.log(`   💾 Updated with: ${suggestedDept.name}`);
        } else {
          console.log(`   ⚠️  Department not found: ${routingResult.data.primaryDepartment}`);
        }
      } else {
        console.log('   ❌ Routing failed');
      }
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

reprocessRouting();
