const express = require("express");
const router = express.Router();
const Message = require("../models/Message"); // Import the Message model we created earlier

// GET /api/chat/:adminId
// This fetches all messages for a specific Admin/Department room
router.get("/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;

    // Find messages for this room and sort them by time (oldest first)
    const messages = await Message.find({ adminId: adminId }).sort({
      timestamp: 1,
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
