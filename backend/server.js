const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, ".env") });

/**
 * Backend server entrypoint
 *
 * Responsibilities:
 * - Configure middleware (CORS, parsers)
 * - Mount API routes
 * - Connect to MongoDB and initialize optional services (e.g., blockchain)
 *
 * Notes for maintainers: ensure `backend/.env` provides MONGO_URI and other required env vars.
 * Contributed: added header and inline comments (docs: add comments to backend/server.js)
 */

// Import routes
const authRoutes = require("./routes/auth");
const documentRoutes = require("./routes/documents");
const userRoutes = require("./routes/users");
const departmentRoutes = require("./routes/departments");
const routingRoutes = require("./routes/routing");
const auditRoutes = require("./routes/audit");
const notificationRoutes = require("./routes/notifications");

const app = express();

// Middleware
// CORS origins are permissive for local development; update this list or use a NODE_ENV check in production
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3002",
      "http://localhost:5002",
    ],
    credentials: true,
  })
);

// Parse JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
// Establish a connection before initializing services that depend on DB.
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");

    // Initialize optional services that rely on DB. Failures here are logged but do not stop the server start.
    // This keeps startup resilient for non-critical services (e.g., blockchain integration).
    const blockchainService = require("./services/blockchain");
    blockchainService.initialize().catch((err) => {
      console.warn(
        "⚠️  Blockchain initialization failed (non-fatal):",
        err.message
      );
    });
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/routing", routingRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/blockchain", require("./routes/blockchain"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start server on configured PORT (defaults to 5000). In production, ensure proper process manager is used (PM2/systemd/container)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
