/****** Reprocess existing documents with AI analysis ******/

require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');
const { extractText } = require('./services/extractText');
const { generateSummary, suggestRouting } = require('./services/geminiService');

async function reprocessDocuments() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    /****** Finding ALL documents to regenerate summaries ******/
    const documents = await Document.find({}).limit(5);

    console.log(`Found ${documents.length} documents to reprocess\n`);

    for (const doc of documents) {
      console.log(`\n******************************************`);
      console.log(`Processing: ${doc.title}`);
      console.log(`ID: ${doc._id}`);
      console.log(`File: ${doc.fileUrl}`);

      try {
        /****** Step 1: Extracting text from the document ******/
        const filePath = doc.fileUrl; // Use the stored file path
        console.log('Extracting text...');
        const extractedText = await extractText(filePath, doc.fileType);
        
        if (!extractedText || extractedText.length < 50) {
          console.log(`Text too short (${extractedText?.length || 0} chars) - skipping`);
          
          /****** Creating basic metadata summary for very short documents ******/
          doc.summary = `This ${doc.category || 'document'} requires review. ` +
            `Categorized as ${doc.urgency || 'medium'} priority. ` +
            `Please download and review the document content.`;
          doc.keyPoints = [
            `Title: ${doc.title}`,
            `Category: ${doc.category || 'General'}`,
            `Urgency: ${doc.urgency || 'Medium'}`,
            `Status: ${doc.status}`,
            'Manual review required'
          ];
          await doc.save();
          console.log('Saved metadata-based summary');
          continue;
        }

        console.log(`Extracted ${extractedText.length} characters`);

        /****** Step 2: Analyzing with Gemini AI ******/
        console.log('Analyzing with Gemini AI...');
        const result = await generateSummary(extractedText, {
          title: doc.title,
          category: doc.category
        });

        /****** Step 3: Get routing suggestions ******/
        console.log('Getting routing suggestions...');
        const routingSuggestion = await suggestRouting(extractedText, {
          title: doc.title,
          category: doc.category
        });

        /****** Step 4: Updating the documents with AI results ******/
        if (result.success) {
          doc.summary = result.data.summary;
          doc.keyPoints = result.data.keyPoints;
          doc.aiUrgency = result.data.aiUrgency;
          doc.aiDeadline = result.data.aiDeadline;
        }
        
        if (routingSuggestion.success) {
          doc.suggestedDepartment = routingSuggestion.data.primaryDepartment;
          doc.routingReason = routingSuggestion.data.reasoning;
          doc.routingConfidence = Math.round(routingSuggestion.data.confidence * 100);
          doc.routingConfirmed = false; // Requires officer confirmation
        }
        
        doc.extractedText = extractedText.substring(0, 5000);

        await doc.save();

        console.log('AI analysis completed!');
        console.log(`Summary: ${result.data?.summary?.substring(0, 100) || 'No summary'}...`);
        console.log(`Key points: ${result.data?.keyPoints?.length || 0}`);
        console.log(`Suggested Department: ${doc.suggestedDepartment || 'None'}`);
        console.log(`Routing Confidence: ${doc.routingConfidence || 0}%`);

        /****** Waiting for 2 seconds to avoid API rate limits ******/
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error processing document:`, error.message);
      }
    }

    console.log('\n******************************************');
    console.log('Reprocessing completed!');
    console.log(`Total processed: ${documents.length} documents`);

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

reprocessDocuments();
