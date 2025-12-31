/**
 * Reprocess existing documents with AI analysis
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');
const { extractText } = require('./services/ocrService');
const { analyzeDocumentText } = require('./services/aiService');

async function reprocessDocuments() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find documents without summaries
    const documents = await Document.find({
      $or: [
        { summary: { $exists: false } },
        { summary: null },
        { summary: '' }
      ]
    }).limit(10);

    console.log(`📄 Found ${documents.length} documents without AI summaries\n`);

    for (const doc of documents) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📝 Processing: ${doc.title}`);
      console.log(`🆔 ID: ${doc._id}`);
      console.log(`📁 File: ${doc.fileUrl}`);

      try {
        // Step 1: Extract text
        console.log('📤 Extracting text...');
        const extraction = await extractText(doc.fileUrl, doc.fileType);
        
        if (!extraction.text || extraction.text.length < 50) {
          console.log(`⚠️  Text too short (${extraction.text?.length || 0} chars) - skipping`);
          
          // Create basic metadata summary
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
          console.log('✅ Saved metadata-based summary');
          continue;
        }

        console.log(`✅ Extracted ${extraction.text.length} characters`);

        // Step 2: Analyze with Gemini
        console.log('🤖 Analyzing with Gemini AI...');
        const analysis = await analyzeDocumentText(extraction.text, {
          title: doc.title,
          category: doc.category
        });

        // Step 3: Update document
        doc.summary = analysis.summary;
        doc.keyPoints = analysis.keyPoints;
        doc.extractedText = extraction.text.substring(0, 5000);
        
        if (analysis.priority) {
          doc.urgency = analysis.priority;
        }

        await doc.save();

        console.log('✅ AI analysis completed!');
        console.log(`📝 Summary: ${analysis.summary.substring(0, 100)}...`);
        console.log(`🔑 Key points: ${analysis.keyPoints?.length || 0}`);

        // Wait 2 seconds to avoid API rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Error processing document:`, error.message);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Reprocessing completed!');
    console.log(`📊 Total processed: ${documents.length} documents`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

reprocessDocuments();
