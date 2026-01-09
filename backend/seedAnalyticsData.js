/**
 * Seed Analytics Data
 * Create sample documents to populate analytics charts
 */

require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');
const Document = require('./models/Document');
const User = require('./models/User');
const Department = require('./models/Department');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get existing users and departments
    const users = await User.find({ role: { $in: ['DEPT_ADMIN', 'DEPT_USER', 'OFFICER'] } }).limit(5);
    const departments = await Department.find().limit(5);

    // Ensure all departments are active
    await Department.updateMany({}, { isActive: true });
    console.log(`Found ${users.length} users and ${departments.length} departments (all set to active)`);

    // Delete old sample documents
    await Document.deleteMany({ title: /^Sample Document/ });
    console.log('Cleared old sample documents\n');

    // Create documents over the past 30 days
    const statuses = ['Pending', 'Approved', 'Rejected', 'In_Progress', 'Completed'];
    const urgencies = ['Low', 'Medium', 'High'];
    const categories = ['finance', 'land', 'hr', 'infrastructure', 'policy', 'legal', 'other'];
    const documents = [];
    let refCounter = 0;

    for (let day = 30; day >= 0; day--) {
      const numDocs = Math.floor(Math.random() * 5) + 2; // 2-6 docs per day
      
      for (let i = 0; i < numDocs; i++) {
        refCounter++;
        const user = users[Math.floor(Math.random() * users.length)];
        const dept = departments[Math.floor(Math.random() * departments.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - day);
        
        // Generate unique reference number using crypto
        const uniqueId = crypto.randomBytes(4).toString('hex');
        const refNum = `SAMPLE-${createdAt.getTime()}-${uniqueId}`;
        
        const doc = {
          title: `Sample Document ${refCounter}`,
          referenceNumber: refNum,
          category: categories[Math.floor(Math.random() * categories.length)],
          description: `This is a sample document for analytics testing`,
          urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
          status: status,
          uploadedBy: user._id,
          initialDepartment: dept._id,
          department: dept._id,
          fileName: `document-${refNum}.pdf`,
          fileUrl: `/uploads/documents/sample-${refNum}.pdf`,
          fileType: 'application/pdf',
          fileSize: Math.floor(Math.random() * 5000000) + 100000,
          summary: 'Sample AI generated summary for analytics',
          tags: ['sample', 'test', 'analytics'],
          createdAt: createdAt,
          updatedAt: createdAt
        };

        // Add processing time for completed documents
        if (status === 'Approved' || status === 'Rejected' || status === 'Completed') {
          const processingHours = Math.floor(Math.random() * 48) + 1; // 1-48 hours
          doc.updatedAt = new Date(createdAt.getTime() + processingHours * 60 * 60 * 1000);
        }

        documents.push(doc);
        
        // Small delay to ensure unique timestamps
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    // Insert documents
    await Document.insertMany(documents);
    console.log(`✅ Created ${documents.length} sample documents\n`);

    // Show summary
    const summary = await Document.aggregate([
      { $match: { title: /^Sample Document/ } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    console.log('Document Summary:');
    summary.forEach(s => console.log(`  ${s._id}: ${s.count}`));
    console.log('');

    console.log('🎉 Analytics data seeded successfully!');
    console.log('Refresh your dashboard to see the charts\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
