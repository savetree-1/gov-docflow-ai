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
const chatRoutes = require("./routes/chat");

/****** Import Services (Merged) ******/
const blockchainService = require("./services/blockchain");
const websocketService = require("./services/websocket");

const app = express();

// 1. Create HTTP Server (Required for Socket.io)
const server = http.createServer(app);

// 2. Initialize Socket.io (For Officer Chat)
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

/****** SOCKET.IO LOGIC (Officer Chat) ******/
io.on("connection", (socket) => {
  console.log("⚡ New Client Connected:", socket.id);

  // 1. Join Admin Room (Private Channel)
  socket.on("join_room", (adminId) => {
    socket.join(adminId);
    console.log(`User ${socket.id} joined room: ${adminId}`);
  });

  // 2. Handle Sending Messages
  socket.on("send_message", async (data) => {
    console.log("📩 Message Received from Frontend:", data);

    try {
      // Step A: Send to everyone INSTANTLY
      io.to(data.adminId).emit("receive_message", data);
      console.log("📡 Message Broadcasted to Room:", data.adminId);

      // Step B: Save to MongoDB
      if (data.adminId && data.message) {
        const newMessage = new Message({
          adminId: data.adminId,
          senderName: data.senderName,
          message: data.message,
          timestamp: new Date(),
        });
        await newMessage.save();
        console.log("✅ Message Saved to DB");
      }
    } catch (err) {
      console.error("❌ Chat Error (DB Save Failed):", err.message);
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

/****** Initialization Logic (Merged) ******/
const initializeServices = async () => {
  console.log("🔄 Initializing blockchain service...");
  try {
    await blockchainService.initialize();
  } catch (error) {
    console.log("⚠️ Blockchain init skipped/failed, but Server is ON.");
  }
};

// 👇 MERGED SERVER STARTUP
// Use server.listen (from http module) so both Socket.io and Express work
server.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);

  // 1. Initialize Blockchain
  await initializeServices();

  // 2. Initialize Existing WebSocket Service (For Notifications)
  // We pass the SAME server instance so they share the port
  if (websocketService && typeof websocketService.initialize === "function") {
    websocketService.initialize(server);
    console.log(`   WebSocket Service (Notifications): Active`);
  }

  console.log(`   Officer Chat (Socket.io): Active\n`);
});

module.exports = { app, server, websocketService };
