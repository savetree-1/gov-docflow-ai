const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message"); 

/****** Loading environment variables ******/
dotenv.config({ path: path.join(__dirname, ".env") });

/****** Importing routes ******/
const authRoutes = require("./routes/auth");
const documentRoutes = require("./routes/documents");
const userRoutes = require("./routes/users");
const departmentRoutes = require("./routes/departments");
const routingRoutes = require("./routes/routing");
const auditRoutes = require("./routes/audit");
const notificationRoutes = require("./routes/notifications");
const chatRoutes = require('./routes/chat'); 

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", process.env.FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/****** Middlewares ******/
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/****** Static server files ******/
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/****** MongoDB Connection ******/
console.log("Connecting to MongoDB...");
const connectDB = require("./config/db");
connectDB();

/****** SOCKET.IO LOGIC (The "Post Office") ******/
io.on("connection", (socket) => {
  console.log("⚡ New Client Connected:", socket.id);

  // 1. Join Admin Room (Private Channel)
  socket.on("join_room", (adminId) => {
    socket.join(adminId);
    console.log(`User ${socket.id} joined room: ${adminId}`);
  });

  // 2. Handle Sending Messages
  // 2. Handle Sending Messages
  socket.on("send_message", async (data) => {
    console.log("📩 Message Received from Frontend:", data); // LOG 1

    try {
      // Step A: Send to everyone INSTANTLY (don't wait for DB)
      io.to(data.adminId).emit("receive_message", data);
      console.log("📡 Message Broadcasted to Room:", data.adminId); // LOG 2

      // Step B: Save to MongoDB in the background
      if (data.adminId && data.message) {
        const newMessage = new Message({
          adminId: data.adminId,
          senderName: data.senderName,
          message: data.message,
          timestamp: new Date(),
        });
        await newMessage.save();
        console.log("✅ Message Saved to DB"); // LOG 3
      }
    } catch (err) {
      console.error("❌ Chat Error (DB Save Failed):", err.message); // LOG 4
    }
  });
});

/****** Routes ******/
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/routing", routingRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/blockchain", require("./routes/blockchain"));
app.use("/api/analytics", require("./routes/analytics"));

/****** Health Check ******/
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

/****** Error Handling ******/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5001;

// Initialize blockchain service
const blockchainService = require("./services/blockchain"); // Ensure this file path is correct in your project
const initializeServices = async () => {
  console.log("🔄 Initializing blockchain service...");
  try {
    // Wrapped in try/catch so Chat works even if Blockchain fails
    await blockchainService.initialize();
  } catch (error) {
    console.log("⚠️ Blockchain init skipped/failed, but Server is ON.");
  }
};

// 👇 CRITICAL CHANGE: Use server.listen instead of app.listen
server.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);

  await initializeServices();
});

module.exports = app;
