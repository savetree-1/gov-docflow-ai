const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Document = require('./models/Document');
  
  const count = await Document.countDocuments();
  console.log(`Found ${count} documents to delete`);
  
  await Document.deleteMany({});
  
  console.log('✅ All documents deleted successfully');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
