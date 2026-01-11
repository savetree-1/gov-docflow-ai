const mongoose = require('mongoose');
require('dotenv').config();

const Document = require('./models/Document');
const Department = require('./models/Department');

async function checkDocs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const docs = await Document.find({}).populate('department initialDepartment');
    
    console.log('\n=== Document Department Assignments ===\n');
    docs.forEach(doc => {
      console.log(`${doc.title}`);
      console.log(`Initial Department: ${doc.initialDepartment?.name || 'None'}`);
      console.log(`Current Department: ${doc.department?.name || 'None'}`);
      console.log(`Status: ${doc.status}`);
      console.log('');
    });
    
    /****** Counting by department ******/
    const financeDocs = await Document.countDocuments({ department: await Department.findOne({ code: 'FIN' }).then(d => d._id) });
    const weatherDocs = await Document.countDocuments({ department: await Department.findOne({ code: 'MET' }).then(d => d._id) });
    
    console.log('=== Document Count by Department ===');
    console.log(`Finance Department: ${financeDocs} documents`);
    console.log(`Weather Department: ${weatherDocs} documents`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDocs();
