/****** Test Blockchain Service to Verify blockchain integration is working ? ******/

require('dotenv').config();
const blockchainService = require('./services/blockchain');

async function testBlockchain() {
  console.log(' Testing Blockchain Integration...\n');

  try {
    /****** Initialization ******/
    await blockchainService.initialize();

    /****** Testing document data for hashing and logging ******/
    const testDoc = {
      _id: 'TEST-DOC-001',
      title: 'Test Budget Approval',
      category: 'finance',
      status: 'Approved'
    };

    const docHash = blockchainService.generateHash(testDoc);
    console.log('Document hash:', docHash, '\n');

    /****** Logging action to blockchain ******/
    console.log('Logging action to blockchain...');
    const result = await blockchainService.logAction({
      documentId: 'PRAVAH-TEST-001',
      actionType: 'APPROVED',
      performedBy: 'Test Officer',
      role: 'Finance Officer',
      department: 'Finance',
      documentHash: docHash,
      previousActionHash: ''
    });

    if (result.success) {
      console.log('\nSuccess!');
      console.log('Transaction Hash:', result.txHash);
      console.log('Block Number:', result.blockNumber);
      console.log('View on PolygonScan:');
      console.log(`https://amoy.polygonscan.com/tx/${result.txHash}\n`);

      /****** Verifying the documents ******/
      console.log(' Verifying document...');
      const verification = await blockchainService.verifyDocument('PRAVAH-TEST-001');
      
      if (verification.verified) {
        console.log(' Document verified!');
        console.log('Actions recorded:', verification.actionCount);
        console.log('Latest action:', verification.latestAction);
      }

    } else {
      console.log('Failed:', result.reason || result.error);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testBlockchain();
