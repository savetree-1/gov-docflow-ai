require('dotenv').config();
const mongoose = require('mongoose');
const { generateSummary, suggestRouting } = require('./services/geminiService');
const Department = require('./models/Department');

const testDocumentText = `
WEATHER FORECAST BULLETIN
Date: January 15, 2025
Uttarakhand Meteorological Department

IMMEDIATE WEATHER ALERT:
Heavy rainfall expected in Dehradun, Haridwar, and Tehri districts over the next 48 hours.
Rainfall intensity: 50-100mm in 24 hours
Wind speed: 30-40 km/h with gusts up to 60 km/h

ADVISORY:
- Residents in low-lying areas should remain alert for possible flash floods
- Hill districts may experience landslides
- Farmers should take precautionary measures to protect crops
- Disaster management teams on standby

Temperature Forecast:
- Dehradun: 18-25°C
- Haridwar: 20-28°C
- Nainital: 8-15°C

This bulletin is issued for immediate circulation to all concerned departments.
`;

async function testAIRouting() {
  try {
    console.log('Connecting to MongoDB...\n');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected\n');

    /****** Step 1: Generate Summary ******/
    console.log('STEP 1: Testing AI Summary Generation...');
    console.log('─'.repeat(60));
    const summaryResponse = await generateSummary(testDocumentText, {
      title: 'Weather Alert Bulletin',
      category: 'Weather Forecast'
    });
    
    const summaryResult = summaryResponse.data || summaryResponse;
    
    if (summaryResponse.success && summaryResult.summary) {
      console.log('Summary Generated:');
      console.log(summaryResult.summary);
      if (summaryResult.keyPoints && summaryResult.keyPoints.length > 0) {
        console.log('Key Points:');
        summaryResult.keyPoints.forEach((point, i) => console.log(`   ${i+1}. ${point}`));
      }
    } else {
      console.log('Summary Generation Failed:', summaryResponse.error);
    }
    console.log('\n');

    /****** Step 2: Get Routing Suggestion ******/
    console.log('STEP 2: Testing AI Routing Suggestion...');
    console.log('─'.repeat(60));
    const routingResponse = await suggestRouting(testDocumentText, {
      title: 'Weather Alert Bulletin',
      category: 'Weather Forecast'
    });
    
    const routingResult = routingResponse.data || routingResponse;
    
    if (routingResult.primaryDepartment) {
      console.log('Routing Suggestion Generated:');
      console.log(`Department: ${routingResult.primaryDepartment}`);
      console.log(`Confidence: ${(routingResult.confidence * 100).toFixed(0)}%`);
      console.log(`Reasoning: ${routingResult.reasoning}`);
    } else {
      console.log('Routing Generation Failed:', routingResponse);
    }
    console.log('\n');

    /****** Step 3: Match to Database Department ******/
    console.log('STEP 3: Testing Department Matching...');
    console.log('*'.repeat(60));
    
    const suggestedName = routingResult.primaryDepartment;
    
    /****** Trying to exact match first ******/
    let matchedDept = await Department.findOne({
      name: { $regex: new RegExp(`^${suggestedName}$`, 'i') }
    });
    
    /****** Trying partial match ******/
    if (!matchedDept) {
      matchedDept = await Department.findOne({
        name: { $regex: new RegExp(suggestedName, 'i') }
      });
    }
    
    /****** Trying keyword match ******/
    if (!matchedDept) {
      const keywords = suggestedName.toLowerCase().split(' ');
      for (const keyword of keywords) {
        if (keyword.length > 3) {
          matchedDept = await Department.findOne({
            name: { $regex: new RegExp(keyword, 'i') }
          });
          if (matchedDept) break;
        }
      }
    }
    
    if (matchedDept) {
      console.log('Department Match Found:');
      console.log(`AI Suggested: "${suggestedName}"`);
      console.log(`Database Match: "${matchedDept.name}"`);
      console.log(`Department ID: ${matchedDept._id}`);
    } else {
      console.log('No Department Match Found');
      console.log(`AI Suggested: "${suggestedName}"`);
      console.log('Available Departments:');
      const allDepts = await Department.find({});
      allDepts.forEach(d => console.log(`   - ${d.name}`));
    }
    console.log('\n');

    /****** Step 4: Simulate Document Save ******/
    console.log('STEP 4: Simulating Document Save with Routing...');
    console.log('*'.repeat(60));
    
    if (matchedDept) {
      const documentData = {
        title: 'Weather Alert Bulletin',
        category: 'Weather Forecast',
        summary: summaryResult.summary,
        department: matchedDept._id,
        suggestedDepartment: routingResult.primaryDepartment,
        routingReason: routingResult.reasoning,
        routingConfidence: (routingResult.confidence * 100).toFixed(0),
        routingConfirmed: false
      };
      
      console.log('Document Would Be Saved With:');
      console.log(JSON.stringify(documentData, null, 2));
      console.log('\nFrontend UI Would Display:');
      console.log('*'.repeat(60));
      console.log('Section: "AI Suggested Routing"');
      console.log(`Department: ${documentData.suggestedDepartment}`);
      console.log(`Confidence: ${documentData.routingConfidence}%`);
      console.log(`Reasoning: ${documentData.routingReason}`);
      console.log('Buttons: [Confirm Routing] [Edit Routing]');
    } else {
      console.log('Cannot save - no department match');
    }
    
    console.log('\n');
    console.log('*'.repeat(60));
    console.log('TEST COMPLETE - All Steps Executed');
    console.log('*'.repeat(60));

  } catch (error) {
    console.error('Test Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testAIRouting();
