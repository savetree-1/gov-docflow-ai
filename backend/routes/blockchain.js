/******* Blockchain Verification API Endpoint ******/

const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const { authMiddleware } = require('../middleware/auth');

/******
      Get Endpoint for Verifing the document integrity against blockchain
      Accessed through: GET /api/blockchain/verify/:documentId
******/
router.get('/verify/:documentId', authMiddleware, async (req, res) => {
  try {
    const { documentId } = req.params;
    
    if (!blockchainService.isEnabled()) {
      return res.json({
        verified: false,
        status: 'blockchain_disabled',
        message: 'Blockchain verification is not enabled in this environment'
      });
    }

    const result = await blockchainService.verifyDocument(documentId);
    
    res.json({
      success: true,
      verified: result.verified,
      actionCount: result.actionCount || 0,
      status: result.status || 'unknown',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Blockchain verification error:', error);
    res.status(500).json({
      success: false,
      verified: false,
      message: 'Verification failed',
      error: error.message
    });
  }
});

/******
    Get Endpoint to Check blockchain service status
    Accessed through: GET /api/blockchain/status
******/
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const enabled = blockchainService.isEnabled();
    
    res.json({
      success: true,
      enabled,
      network: enabled ? 'Polygon Mumbai Testnet' : 'N/A',
      status: enabled ? 'operational' : 'disabled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check blockchain status',
      error: error.message
    });
  }
});

module.exports = router;
