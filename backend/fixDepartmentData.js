const mongoose = require('mongoose');
const Department = require('./models/Department');
const Document = require('./models/Document');

async function fixDepartmentData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pravaah', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get all departments
    const departments = await Department.find();
    console.log(`\nFound ${departments.length} departments`);

    // Update all departments to be active
    await Department.updateMany({}, { isActive: true });
    console.log('✓ All departments marked as active');

    // Check documents and their department associations
    const docs = await Document.find({ isDeleted: { $ne: true } });
    console.log(`\nFound ${docs.length} documents`);

    // Count documents per department
    for (const dept of departments) {
      const docCount = await Document.countDocuments({
        department: dept._id,
        isDeleted: { $ne: true }
      });
      console.log(`${dept.name} (${dept.code}): ${docCount} documents`);
    }

    // If documents exist but aren't linked to departments, link them
    const unlinkedDocs = await Document.countDocuments({
      department: { $exists: false },
      isDeleted: { $ne: true }
    });

    if (unlinkedDocs > 0 && departments.length > 0) {
      console.log(`\n${unlinkedDocs} documents without department. Assigning randomly...`);
      const docsToUpdate = await Document.find({
        department: { $exists: false },
        isDeleted: { $ne: true }
      });

      for (const doc of docsToUpdate) {
        const randomDept = departments[Math.floor(Math.random() * departments.length)];
        doc.department = randomDept._id;
        await doc.save();
      }
      console.log('✓ All documents linked to departments');
    }

    console.log('\n✓ Department data fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixDepartmentData();
