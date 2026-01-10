/****** Module Test AI Processing on Existing Document ******/

require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');
const { extractText } = require('./services/ocrService');
const { generateSummary, suggestRouting } = require('./services/aiService');

async function testAIProcessing() {
  try {
    /****** Connecting to MongoDB ******/
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' Connected to MongoDB');

    /****** Taking out the latest document ******/
    const document = await Document.findOne().sort({ createdAt: -1 });
    
    if (!document) {
      console.log(' No documents found');
      process.exit(1);
    }

    console.log(`\n Testing AI on document: ${document.title}`);
    console.log(` File URL: ${document.fileUrl}`);
    console.log(` ID: ${document._id}\n`);
    
    /****** Constructing full file path for local testing ******/
    const fullPath = `/Users/anks/Documents/GitHub/krishi-sadhan/backend/${document.fileUrl}`;
    console.log(` Full path: ${fullPath}\n`);

    /****** Step 1: Extracting text ******/
    console.log(' Extracting text from document...');
    const extraction = await extractText(fullPath, document.fileType);
    
    if (!extraction.success || !extraction.text || extraction.text.length < 10) {
      console.log('  No text extracted or text too short');
      console.log('Text length:', extraction.text?.length || 0);
      console.log('Error:', extraction.error);
      process.exit(1);
    }

    console.log(` Text extracted: ${extraction.text.length} characters`);
    console.log(`Preview: ${extraction.text.substring(0, 200)}...\n`);

    /****** Step 2: Generating AI summary ******/
    console.log(' Generating AI summary...');
    const aiAnalysis = await generateSummary(extraction.text, {
      title: document.title,
      category: document.category
    });

    console.log('\n AI Analysis Results:');
    console.log('Summary:', aiAnalysis.summary);
    console.log('\nKey Points:');
    aiAnalysis.keyPoints.forEach((point, idx) => {
      console.log(`  ${idx + 1}. ${point}`);
    });
    console.log('\nPriority:', aiAnalysis.priority);
    console.log('Deadlines:', aiAnalysis.deadlines);
 
    /****** Step 3: Taking routing suggestions from AI ******/
    console.log('\n Getting routing suggestions...');
    const routingSuggestion = await suggestRouting(extraction.text, {
      title: document.title,
      category: document.category
    });

    console.log('\nRouting Suggestions:');
    console.log('Primary Department:', routingSuggestion.primaryDepartment);
    console.log('Secondary Departments:', routingSuggestion.secondaryDepartments);
    console.log('Reasoning:', routingSuggestion.reasoning);
    console.log('Urgency:', routingSuggestion.urgency);

    /****** Step 4: Updating document in database ******/
    console.log('\n Updating document in database...');
    document.summary = aiAnalysis.summary;
    document.keyPoints = aiAnalysis.keyPoints;
    document.extractedText = extraction.text.substring(0, 5000);
    document.urgency = aiAnalysis.priority || document.urgency;
    
    await document.save();
    
    console.log(' Document updated successfully!');
    console.log(`\n View at: http://localhost:3000/document/${document._id}`);

  } catch (error) {
    console.error(' Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n Disconnected from MongoDB');
  }
}

testAIProcessing();
