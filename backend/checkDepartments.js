const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  const Document = require('./models/Document');
  
  console.log('****** WEATHER ADMIN ******');
  const weatherAdmin = await User.findOne({ email: 'ukweatherdept.gov@gmail.com' }).populate('department');
  console.log('Email:', weatherAdmin.email);
  console.log('Role:', weatherAdmin.role);
  console.log('Department ObjectId:', weatherAdmin.department ? weatherAdmin.department._id : 'NULL');
  console.log('Department Name:', weatherAdmin.department ? weatherAdmin.department.name : 'NULL');
  
  console.log('\n****** ALL DOCUMENTS ******');
  const docs = await Document.find({}).populate('department').select('title department status uploadedBy');
  docs.forEach(doc => {
    console.log(`${doc.title} -> Dept: ${doc.department ? doc.department.name : 'NULL'} | Status: ${doc.status}`);
  });
  
  console.log('\n****** TESTING QUERY ******');
  const weatherDeptId = weatherAdmin.department ? weatherAdmin.department._id : null;
  console.log('Query: { department:', weatherDeptId, '}');
  const filteredDocs = await Document.find({ department: weatherDeptId }).populate('department').select('title department');
  console.log(`Found ${filteredDocs.length} documents for Meteorology:`);
  filteredDocs.forEach(doc => {
    console.log(`  - ${doc.title}`);
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
