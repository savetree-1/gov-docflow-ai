const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  adminId: {
    type: String, // This is the 'Room ID'
    required: true,
    index: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", MessageSchema);
