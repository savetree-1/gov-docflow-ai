/**
 * Script to make Infrastructure Department pending
 * Run: node makeInfrastructurePending.js
 */

const mongoose = require('mongoose');
const Department = require('./models/Department');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pravah_prototype';

async function makeInfrastructurePending() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB\n');

    // Find Infrastructure department
    const infraDept = await Department.findOne({ 
      name: { $regex: /infrastructure/i }
    });

    if (!infraDept) {
      console.log('Infrastructure department not found');
      process.exit(0);
    }

    console.log('Found Infrastructure Department:');
    console.log(`- Name: ${infraDept.name}`);
    console.log(`- Current Status: ${infraDept.status}`);
    console.log(`- Email: ${infraDept.email}`);

    // Update to Pending
    infraDept.status = 'Pending';
    await infraDept.save();

    console.log('\n✅ Infrastructure Department status updated to Pending');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

makeInfrastructurePending();
