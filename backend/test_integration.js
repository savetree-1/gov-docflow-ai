/**
 * Test Complete Blockchain Integration
 * Tests: Document action → Blockchain logging → Verification
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');
const User = require('./models/User');
const blockchainService = require('./services/blockchain');

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing Complete Blockchain Integration\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Initialize blockchain
    await blockchainService.initialize();
    console.log('');

    // Find a test document (or use a specific ID)
    const document = await Document.findOne().sort({ createdAt: -1 });
    
    if (!document) {
      console.log('❌ No documents found. Upload a document first.');
      process.exit(1);
    }

    console.log('📄 Test Document:', document.title);
    console.log('🆔 Document ID:', document._id);
    console.log('');

    // Simulate document action
    const testUser = await User.findOne();
    const docHash = blockchainService.generateHash({
      id: document._id,
      title: document.title,
      status: 'Approved',
      timestamp: new Date()
    });

    console.log('📝 Logging TEST action to blockchain...');
    const bcResult = await blockchainService.logAction({
      documentId: `PRAVAH-${document._id.toString().slice(-8).toUpperCase()}`,
      actionType: 'TEST_ACTION',
      performedBy: testUser ? `${testUser.firstName} ${testUser.lastName}` : 'Test Officer',
      role: testUser?.role || 'OFFICER',
      department: document.category || 'General',
      documentHash: docHash,
      previousActionHash: ''
    });

    if (bcResult.success) {
      console.log('✅ Blockchain logged successfully!');
      console.log('📋 Transaction Hash:', bcResult.txHash);
      console.log('🔗 Block Number:', bcResult.blockNumber);
      console.log('🌐 View on PolygonScan:');
      console.log(`   https://amoy.polygonscan.com/tx/${bcResult.txHash}`);
      console.log('');

      // Save blockchain info to document
      document.blockchainTxHash = bcResult.txHash;
      document.blockchainVerified = true;
      await document.save();
      console.log('✅ Document updated with blockchain info\n');

      // Verify the document
      console.log('🔍 Verifying document on blockchain...');
      const verification = await blockchainService.verifyDocument(
        `PRAVAH-${document._id.toString().slice(-8).toUpperCase()}`
      );

      if (verification.verified) {
        console.log('✅ Verification successful!');
        console.log('📊 Total actions recorded:', verification.actionCount);
        console.log('⏱️  Latest action timestamp:', verification.latestAction.timestamp);
        console.log('');

        // Test the API endpoint simulation
        console.log('🌐 API Endpoint Response Simulation:');
        console.log(JSON.stringify({
          success: true,
          data: {
            verified: verification.verified,
            documentId: `PRAVAH-${document._id.toString().slice(-8).toUpperCase()}`,
            blockchainTxHash: bcResult.txHash,
            actionCount: verification.actionCount,
            latestAction: verification.latestAction,
            polygonScanUrl: `https://amoy.polygonscan.com/tx/${bcResult.txHash}`
          }
        }, null, 2));
        console.log('');

        console.log('🎉 INTEGRATION TEST PASSED!');
        console.log('');
        console.log('✅ Full Flow Working:');
        console.log('   1. Document action performed');
        console.log('   2. Action logged to blockchain');
        console.log('   3. Document updated with blockchain hash');
        console.log('   4. Blockchain verification successful');
        console.log('   5. API endpoint ready for frontend');

      } else {
        console.log('❌ Verification failed:', verification.reason);
      }

    } else {
      console.log('❌ Blockchain logging failed:', bcResult.reason || bcResult.error);
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testCompleteFlow();
