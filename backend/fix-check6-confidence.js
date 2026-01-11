require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');

async function fixCheck6Confidence() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected\n');

    const doc = await Document.findOne({ title: 'Check 6' });
    
    if (!doc) {
      console.log('Document "Check 6" not found');
      await mongoose.disconnect();
      return;
    }

    console.log('Current confidence:', doc.routingConfidence);
    
    /****** Fixing confidence if it's a decimal ******/
    if (doc.routingConfidence && doc.routingConfidence < 1) {
      doc.routingConfidence = Math.round(doc.routingConfidence * 100);
      await doc.save();
      console.log('Updated confidence to:', doc.routingConfidence + '%');
    } else {
      console.log('Confidence already correct:', doc.routingConfidence + '%');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

fixCheck6Confidence();
