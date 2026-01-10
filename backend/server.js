const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

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

const app = express();

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

/****** Routes For Accesing The Application  ******/
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/routing', routingRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationRoutes);
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

const PORT = process.env.PORT || 5001;

/****** Initializing the blockchain and websocket services on startup ******/
const blockchainService = require('./services/blockchain');
const websocketService = require('./services/websocket');

const initializeServices = async () => {
  console.log('🔄 Initializing blockchain service...');
  await blockchainService.initialize();
};

const server = app.listen(PORT, async () => {
  console.log(`\nServer running on port ${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);

  /****** Initializing the services after server starts ******/
  await initializeServices();
  
  /****** Initialize WebSocket for real-time notifications ******/
  websocketService.initialize(server);
  console.log(`   WebSocket: ws://localhost:${PORT}\n`);
});

module.exports = { app, server, websocketService };
