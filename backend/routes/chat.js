const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET /api/chat/:roomId - Get chat history
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ adminId: roomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
