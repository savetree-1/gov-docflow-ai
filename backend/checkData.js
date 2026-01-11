const mongoose = require('mongoose');
require('dotenv').config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas\n');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('Database: pravah_prototype');
    console.log('*'.repeat(60));
    
    if (collections.length === 0) {
      console.log('No collections found (database is empty)');
    } else {
      for (const coll of collections) {
        const count = await db.collection(coll.name).countDocuments();
        const emoji = count > 0 ? 'Y' : 'N';
        console.log(`${emoji} ${coll.name.padEnd(25)} ${count.toString().padStart(5)} documents`);
      }
    }
    
    console.log('*'.repeat(60));
    
    // Get total
    let total = 0;
    for (const coll of collections) {
      total += await db.collection(coll.name).countDocuments();
    }
    console.log(`\nTotal Documents: ${total}`);
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB Atlas');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkData();
