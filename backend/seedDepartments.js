/**
 * Seed Departments - Create sample departments for testing
 * Run: node seedDepartments.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const Department = require('./models/Department');

// Sample Government Departments
const departments = [
  {
    name: 'Finance',
    code: 'FIN',
    nodalOfficer: {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@pravah.gov.in',
      phone: '+91-9876543210'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Revenue',
    code: 'REV',
    nodalOfficer: {
      name: 'Priya Sharma',
      email: 'priya.sharma@pravah.gov.in',
      phone: '+91-9876543211'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Agriculture',
    code: 'AGR',
    nodalOfficer: {
      name: 'Amit Singh',
      email: 'amit.singh@pravah.gov.in',
      phone: '+91-9876543212'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Infrastructure',
    code: 'INF',
    nodalOfficer: {
      name: 'Meera Patel',
      email: 'meera.patel@pravah.gov.in',
      phone: '+91-9876543213'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Disaster Management',
    code: 'DIS',
    nodalOfficer: {
      name: 'Vikram Rao',
      email: 'vikram.rao@pravah.gov.in',
      phone: '+91-9876543214'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Human Resources',
    code: 'HR',
    nodalOfficer: {
      name: 'Anita Desai',
      email: 'anita.desai@pravah.gov.in',
      phone: '+91-9876543215'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Legal',
    code: 'LEG',
    nodalOfficer: {
      name: 'Suresh Reddy',
      email: 'suresh.reddy@pravah.gov.in',
      phone: '+91-9876543216'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Policy',
    code: 'POL',
    nodalOfficer: {
      name: 'Kavita Nair',
      email: 'kavita.nair@pravah.gov.in',
      phone: '+91-9876543217'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Land Management',
    code: 'LND',
    nodalOfficer: {
      name: 'Ramesh Verma',
      email: 'ramesh.verma@pravah.gov.in',
      phone: '+91-9876543218'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Education',
    code: 'EDU',
    nodalOfficer: {
      name: 'Sunita Gupta',
      email: 'sunita.gupta@pravah.gov.in',
      phone: '+91-9876543219'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Health',
    code: 'HLT',
    nodalOfficer: {
      name: 'Dr. Anil Khanna',
      email: 'anil.khanna@pravah.gov.in',
      phone: '+91-9876543220'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Transport',
    code: 'TRA',
    nodalOfficer: {
      name: 'Mohit Jain',
      email: 'mohit.jain@pravah.gov.in',
      phone: '+91-9876543221'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Meteorology',
    code: 'MET',
    nodalOfficer: {
      name: 'Weather Department Admin',
      email: 'ukweatherdept.gov@gmail.com',
      phone: '+91-9876543222'
    },
    status: 'Approved',
    isActive: true
  }
];

async function seedDepartments() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    // Clear existing departments
    console.log('🗑️  Clearing existing departments...');
    await Department.deleteMany({});
    console.log('✅ Existing departments cleared');

    // Insert new departments
    console.log('📝 Creating departments...');
    const createdDepartments = await Department.insertMany(departments);
    console.log(`✅ ${createdDepartments.length} departments created successfully`);

    // Display created departments
    console.log('\n📋 Created Departments:');
    console.log('------------------------');
    createdDepartments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name} (${dept.code}) - ${dept.nodalOfficer.name}`);
    });
    console.log('------------------------\n');

    console.log('🎉 Department seeding completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding departments:', error);
    process.exit(1);
  }
}

// Run seeder
seedDepartments();
