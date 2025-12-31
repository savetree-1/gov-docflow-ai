const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');

async function addDemoUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/krishi-sadhan', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB\n');

    // Find Finance Department
    const financeDept = await Department.findOne({ code: 'FIN' });
    
    if (!financeDept) {
      console.log('❌ Finance Department not found!');
      console.log('💡 Run: node seed.js first');
      mongoose.connection.close();
      return;
    }

    console.log(`📁 Found Finance Department: ${financeDept.name}`);
    console.log(`   ID: ${financeDept._id}\n`);

    // Check existing officers
    const existingOfficers = await User.find({ 
      department: financeDept._id,
      role: 'OFFICER'
    });
    
    console.log(`👥 Existing Officers in Finance: ${existingOfficers.length}\n`);

    // Demo officers to add
    const demoOfficers = [
      {
        firstName: 'Ramesh',
        lastName: 'Verma',
        email: 'ramesh.verma@gov.in',
        password: await bcrypt.hash('Officer@123', 10),
        phone: '+91-9876543220',
        employeeId: 'FIN-OFF-001',
        role: 'OFFICER',
        department: financeDept._id,
        isApproved: true,
        isActive: true
      },
      {
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@gov.in',
        password: await bcrypt.hash('Officer@123', 10),
        phone: '+91-9876543221',
        employeeId: 'FIN-OFF-002',
        role: 'OFFICER',
        department: financeDept._id,
        isApproved: true,
        isActive: true
      },
      {
        firstName: 'Amit',
        lastName: 'Patel',
        email: 'amit.patel@gov.in',
        password: await bcrypt.hash('Officer@123', 10),
        phone: '+91-9876543222',
        employeeId: 'FIN-OFF-003',
        role: 'OFFICER',
        department: financeDept._id,
        isApproved: true,
        isActive: true
      }
    ];

    console.log('➕ Adding demo officers...\n');

    for (const officer of demoOfficers) {
      const existing = await User.findOne({ email: officer.email });
      
      if (existing) {
        console.log(`   ⏭️  ${officer.firstName} ${officer.lastName} already exists`);
      } else {
        await User.create(officer);
        console.log(`   ✅ Created ${officer.firstName} ${officer.lastName} (${officer.email})`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Final Count:');
    
    const totalOfficers = await User.countDocuments({
      department: financeDept._id,
      role: 'OFFICER'
    });
    
    console.log(`   Officers in Finance Department: ${totalOfficers}`);
    
    console.log('\n🎯 Now login as:');
    console.log('   Email: finance@gov.in');
    console.log('   Password: Finance@123');
    console.log(`   You should see ${totalOfficers} users!\n`);

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addDemoUsers();
