/**
 * Blockchain Service - Immutable Audit Trail
 * Logs critical document actions to Polygon blockchain
 */

const { ethers } = require('ethers');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.isInitialized = false;
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      if (this.isInitialized) return;

      // Load deployment info
      const deploymentPath = path.join(__dirname, '../blockchain/deployment.json');
      if (!fs.existsSync(deploymentPath)) {
        console.warn('Blockchain not configured. Run: node blockchain/deploy.js');
        return;
      }

      const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

      // Connect to Polygon Amoy
      this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
      this.wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, this.provider);
      
      // Initialize contract
      this.contract = new ethers.Contract(
        deployment.contractAddress,
        deployment.abi,
        this.wallet
      );

      this.isInitialized = true;
      console.log('Blockchain service initialized');
      console.log('Contract:', deployment.contractAddress);
    } catch (error) {
      console.error('Blockchain initialization failed:', error.message);
    }
  }

  /**
   * Generate document hash
   */
  generateHash(documentData) {
    const data = JSON.stringify(documentData);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Log action to blockchain
   */
  async logAction(actionData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.contract) {
        console.warn('Blockchain not available, skipping...');
        return { success: false, reason: 'Blockchain not configured' };
      }

      const {
        documentId,
        actionType,
        performedBy,
        role,
        department,
        documentHash,
        previousActionHash = ''
      } = actionData;

      console.log(`Logging to blockchain: ${actionType} for ${documentId}`);

      // Send transaction
      const tx = await this.contract.logAction(
        documentId,
        actionType,
        performedBy,
        role,
        department,
        documentHash,
        previousActionHash
      );

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();

      console.log('Blockchain logged:', receipt.hash);

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Blockchain logging failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify document integrity
   */
  async verifyDocument(documentId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.contract) {
        return { verified: false, reason: 'Blockchain not configured' };
      }

      const actionCount = await this.contract.getActionCount(documentId);
      
      if (actionCount === 0n) {
        return { verified: false, reason: 'No blockchain records found' };
      }

      // Get latest action
      const latestAction = await this.contract.getAction(documentId, Number(actionCount) - 1);

      return {
        verified: true,
        actionCount: Number(actionCount),
        latestAction: {
          type: latestAction[0],
          performedBy: latestAction[1],
          role: latestAction[2],
          department: latestAction[3],
          timestamp: new Date(Number(latestAction[4]) * 1000).toISOString(),
          documentHash: latestAction[5]
        }
      };

    } catch (error) {
      console.error('Verification failed:', error.message);
      return { verified: false, error: error.message };
    }
  }

  /**
   * Get full audit trail for document
   */
  async getAuditTrail(documentId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.contract) {
        return [];
      }

      const actionCount = await this.contract.getActionCount(documentId);
      const trail = [];

      for (let i = 0; i < Number(actionCount); i++) {
        const action = await this.contract.getAction(documentId, i);
        trail.push({
          actionType: action[0],
          performedBy: action[1],
          role: action[2],
          department: action[3],
          timestamp: new Date(Number(action[4]) * 1000).toISOString(),
          documentHash: action[5],
          previousActionHash: action[6]
        });
      }

      return trail;

    } catch (error) {
      console.error('Audit trail fetch failed:', error.message);
      return [];
    }
  }
}

// Export singleton instance
module.exports = new BlockchainService();
