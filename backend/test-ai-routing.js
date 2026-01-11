const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Document = require('./models/Document');
const Department = require('./models/Department');
const { generateSummary, suggestRouting } = require('./services/geminiService');

async function testAIRouting() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('\n🧪 Testing AI Routing System\n');
    
    // Test document text (weather forecast)
    const testDocumentText = `
      This is an All India Impact Based Weather Warning Bulletin issued by the 
      India Meteorological Department for Uttarakhand region. The forecast covers 
      January 9-13, 2020, providing district-wise predictions for rainfall intensity 
      and distribution. It warns of heavy to extremely heavy rainfall across various 
      regions and advises fishermen to avoid affected waters.
    `;
    
    const testMetadata = {
      title: 'Weather Forecast Test',
      category: 'weather'
    };
    
    // STEP 1: Test AI Summary Generation
    console.log('📝 Step 1: Generating AI Summary...');
    const summaryResult = await generateSummary(testDocumentText, testMetadata);
    
    if (summaryResult.success) {
      console.log('✅ Summary Generated:');
      console.log('   Length:', summaryResult.data.summary.length, 'characters');
      console.log('   Preview:', summaryResult.data.summary.substring(0, 100) + '...');
    } else {
      console.log('❌ Summary Generation Failed:', summaryResult.error);
    }
    
    // STEP 2: Test AI Routing Suggestion
    console.log('\n🎯 Step 2: Generating Routing Suggestion...');
    const routingResult = await suggestRouting(testDocumentText, testMetadata);
    
    if (routingResult.success) {
      console.log('✅ Routing Suggestion Generated:');
      console.log('   Suggested Department:', routingResult.data.primaryDepartment);
      console.log('   Confidence:', routingResult.data.confidence);
      console.log('   Reasoning:', routingResult.data.reasoning);
    } else {
      console.log('❌ Routing Generation Failed:', routingResult.error);
    }
    
    // STEP 3: Test Department Matching
    console.log('\n🔍 Step 3: Matching to Database Department...');
    const suggestedDept = await Department.findOne({
      name: new RegExp(routingResult.data.primaryDepartment, 'i')
    });
    
    if (suggestedDept) {
      console.log('✅ Department Matched:');
      console.log('   Database Name:', suggestedDept.name);
      console.log('   Code:', suggestedDept.code);
      console.log('   ID:', suggestedDept._id);
    } else {
      console.log('❌ Department Not Found in Database');
      console.log('   Suggested:', routingResult.data.primaryDepartment);
      console.log('   Available departments:');
      const allDepts = await Department.find({});
      allDepts.forEach(d => console.log('   -', d.name, `(${d.code})`));
    }
    
    // STEP 4: Simulate Document Save
    console.log('\n💾 Step 4: Simulating Document Save...');
    if (summaryResult.success && routingResult.success && suggestedDept) {
      console.log('✅ Document would be saved with:');
      console.log('   summary:', summaryResult.data.summary.substring(0, 50) + '...');
      console.log('   department:', suggestedDept.name);
      console.log('   suggestedDepartment:', routingResult.data.primaryDepartment);
      console.log('   routingReason:', routingResult.data.reasoning);
      console.log('   routingConfidence:', routingResult.data.confidence);
      console.log('   routingConfirmed:', false);
      console.log('\n✅ Frontend would show: "AI Suggested Routing" section');
      console.log('   with "Confirm Routing" and "Edit Routing" buttons');
    } else {
      console.log('❌ Document save would fail - missing data');
    }
    
    console.log('\n🎉 Test Complete!\n');
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    process.exit(1);
  }
}

testAIRouting();
