const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http'); // Required for Socket.io
const { Server } = require("socket.io"); // Required for Socket.io
const Message = require("./models/Message"); 

/****** Loading environment variables from backend/.env ******/
dotenv.config({ path: path.join(__dirname, '.env') });

/****** Importing routes ******/
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const userRoutes = require('./routes/users');
const departmentRoutes = require('./routes/departments');
const routingRoutes = require('./routes/routing');
const auditRoutes = require('./routes/audit');
const notificationRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chat'); // NEW

const app = express();

// 1. Create HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', process.env.FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true
  }
});

/****** Middlewares ******/
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/****** Static server files from uploads directory ******/
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/****** MongoDB Connection Startup******/
console.log('Connecting to MongoDB...');
const connectDB = require('./config/db');
connectDB();

// SOCKET.IO LOGIC (Chat)
io.on("connection", (socket) => {
  console.log("⚡ New Client Connected (Chat):", socket.id);

  socket.on("join_room", (adminId) => {
    socket.join(adminId);
    console.log(`🚪 User ${socket.id} joined room: ${adminId}`);
    console.log(`📊 Room ${adminId} now has ${io.sockets.adapter.rooms.get(adminId)?.size || 0} members`);
  });

  socket.on("send_message", async (data) => {
    try {
      console.log(`📤 Broadcasting to room ${data.adminId}:`, data.message);
      console.log(`📊 Room has ${io.sockets.adapter.rooms.get(data.adminId)?.size || 0} members`);
      io.to(data.adminId).emit("receive_message", data);
      
      if (data.adminId && data.message) {
        const newMessage = new Message({
          adminId: data.adminId,
          senderName: data.senderName,
          message: data.message,
          timestamp: new Date(),
        });
        await newMessage.save();
      }
    } catch (err) {
      console.error("Chat Error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

/****** Routes For Accesing The Application  ******/
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/routing', routingRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes); // NEW
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/analytics', require('./routes/analytics'));

/****** Health check Url for checking bakcend connectivity******/
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

/****** Middlewares for Error handling ******/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const blockchainService = require('./services/blockchain');
const websocketService = require('./services/websocket');

const initializeServices = async () => {
  try {
      await blockchainService.initialize();
  } catch (e) { console.log("Blockchain init skipped"); }
};

const PORT = process.env.PORT || 5001;

/****** Start Server ******/
server.listen(PORT, async () => {
  console.log(`\nServer running on port ${PORT}`);
  await initializeServices();
  websocketService.initialize(server, io); // Pass existing io instance
  console.log(`   WebSocket Services: Active\n`);
});

module.exports = { app, server, websocketService };
