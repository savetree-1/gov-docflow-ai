const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    const dbName = mongoose.connection.db.databaseName;
    console.log('✅ MongoDB Connected');
    console.log(`📊 Database: ${dbName}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
