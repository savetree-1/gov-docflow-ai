/****** Clean Database Setup Module which sets up real departments and users only ******/

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');
const Document = require('./models/Document');

async function cleanSetup() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas\n');

    /****** Clearing the existing data ******/
    console.log('Clearing existing data...');
    await Document.deleteMany({});
    await User.deleteMany({});
    await Department.deleteMany({});
    console.log('✓ Database cleared\n');

    /****** Creating departments and making all in Pending status ******/
    console.log('Creating departments...');
    const departments = [
      {
        name: 'Finance Department',
        code: 'FIN',
        contactEmail: 'finance.admin@pravah.gov.in',
        contactPhone: '+91-11-2301-0001',
        address: 'North Block, New Delhi',
        nodalOfficer: {
          name: 'Finance Admin',
          email: 'finance.admin@pravah.gov.in',
          phone: '+91-98000-00001'
        },
        approvalStatus: 'Pending',
        isActive: false,
        createdAt: new Date()
      },
      {
        name: 'Disaster Management Department',
        code: 'DM',
        contactEmail: 'disaster.admin@pravah.gov.in',
        contactPhone: '+91-11-2301-0002',
        address: 'NDMA Bhawan, New Delhi',
        nodalOfficer: {
          name: 'Disaster Admin',
          email: 'disaster.admin@pravah.gov.in',
          phone: '+91-98000-00002'
        },
        approvalStatus: 'Pending',
        isActive: false,
        createdAt: new Date()
      },
      {
        name: 'Weather (Meteorology) Department',
        code: 'MET',
        contactEmail: 'ukweatherdept.gov@gmail.com',
        contactPhone: '+91-11-2301-0003',
        address: 'Mausam Bhawan, New Delhi',
        nodalOfficer: {
          name: 'Weather Admin',
          email: 'ukweatherdept.gov@gmail.com',
          phone: '+91-98000-00003'
        },
        approvalStatus: 'Pending',
        isActive: false,
        createdAt: new Date()
      },
      {
        name: 'Agriculture Department',
        code: 'AGRI',
        contactEmail: 'agriculture.admin@pravah.gov.in',
        contactPhone: '+91-11-2301-0004',
        address: 'Krishi Bhawan, New Delhi',
        nodalOfficer: {
          name: 'Agriculture Admin',
          email: 'agriculture.admin@pravah.gov.in',
          phone: '+91-98000-00004'
        },
        approvalStatus: 'Pending',
        isActive: false,
        createdAt: new Date()
      },
      {
        name: 'Infrastructure Department',
        code: 'INFRA',
        contactEmail: 'infra.admin@pravah.gov.in',
        contactPhone: '+91-11-2301-0005',
        address: 'Nirman Bhawan, New Delhi',
        nodalOfficer: {
          name: 'Infrastructure Admin',
          email: 'infra.admin@pravah.gov.in',
          phone: '+91-98000-00005'
        },
        approvalStatus: 'Pending',
        isActive: false,
        createdAt: new Date()
      }
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log(`✓ Created ${createdDepartments.length} departments (all Pending)\n`);

    /****** Mapping department codes to IDs ******/
    const deptMap = {};
    createdDepartments.forEach(dept => {
      deptMap[dept.code] = dept._id;
    });

    /****** Creating users ******/
    console.log('Creating users...');
    const users = [];

    /****** Super Admin User******/
    users.push({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@pravah.gov.in',
      password: await bcrypt.hash('Admin@2025', 10),
      employeeId: 'ADMIN-001',
      role: 'SUPER_ADMIN',
      isApproved: true,
      isActive: true
    });

    /****** Department Admins Users ******/
    const deptAdmins = [
      { firstName: 'Finance', lastName: 'Admin', email: 'finance.admin@pravah.gov.in', password: 'Finance@123', dept: 'FIN' },
      { firstName: 'Disaster', lastName: 'Admin', email: 'disaster.admin@pravah.gov.in', password: 'Disaster@123', dept: 'DM' },
      { firstName: 'Weather', lastName: 'Admin', email: 'ukweatherdept.gov@gmail.com', password: 'Weather@123', dept: 'MET' },
      { firstName: 'Agriculture', lastName: 'Admin', email: 'agriculture.admin@pravah.gov.in', password: 'Agri@123', dept: 'AGRI' },
      { firstName: 'Infrastructure', lastName: 'Admin', email: 'infra.admin@pravah.gov.in', password: 'Infra@123', dept: 'INFRA' }
    ];

    let empIdCounter = 100;
    for (const admin of deptAdmins) {
      users.push({
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        password: await bcrypt.hash(admin.password, 10),
        employeeId: `${admin.dept}-ADMIN-${empIdCounter++}`,
        role: 'DEPARTMENT_ADMIN',
        department: deptMap[admin.dept],
        isApproved: false, /****** This document will be approved when department is approved ******/
        isActive: false
      });
    }

    /****** Officers ******/
    const officers = [
      // Finance
      { firstName: 'Suresh', lastName: 'Patel', email: 'finance.officer1@pravah.gov.in', dept: 'FIN' },
      { firstName: 'Meena', lastName: 'Gupta', email: 'finance.officer2@pravah.gov.in', dept: 'FIN' },
      // Disaster Management
      { firstName: 'Anil', lastName: 'Singh', email: 'disaster.officer1@pravah.gov.in', dept: 'DM' },
      { firstName: 'Pooja', lastName: 'Reddy', email: 'disaster.officer2@pravah.gov.in', dept: 'DM' },
      // Weather
      { firstName: 'Deepak', lastName: 'Joshi', email: 'weather.officer1@pravah.gov.in', dept: 'MET' },
      { firstName: 'Sneha', lastName: 'Nair', email: 'weather.officer2@pravah.gov.in', dept: 'MET' },
      // Agriculture
      { firstName: 'Ravi', lastName: 'Yadav', email: 'agri.officer1@pravah.gov.in', dept: 'AGRI' },
      { firstName: 'Kavita', lastName: 'Desai', email: 'agri.officer2@pravah.gov.in', dept: 'AGRI' },
      // Infrastructure
      { firstName: 'Sanjay', lastName: 'Malhotra', email: 'infra.officer1@pravah.gov.in', dept: 'INFRA' },
      { firstName: 'Anjali', lastName: 'Mehta', email: 'infra.officer2@pravah.gov.in', dept: 'INFRA' }
    ];

    empIdCounter = 200;
    for (const officer of officers) {
      users.push({
        firstName: officer.firstName,
        lastName: officer.lastName,
        email: officer.email,
        password: await bcrypt.hash('Officer@123', 10),
        employeeId: `${officer.dept}-OFF-${empIdCounter++}`,
        role: 'OFFICER',
        department: deptMap[officer.dept],
        isApproved: false, // Will be approved when department is approved
        isActive: false
      });
    }

    /****** Auditors ******/
    users.push({
      firstName: 'Ramesh',
      lastName: 'Iyer',
      email: 'auditor1@pravah.gov.in',
      password: await bcrypt.hash('Auditor@123', 10),
      employeeId: 'AUDIT-001',
      role: 'AUDITOR',
      isApproved: true,
      isActive: true
    });

    users.push({
      firstName: 'Lakshmi',
      lastName: 'Bhat',
      email: 'auditor2@pravah.gov.in',
      password: await bcrypt.hash('Auditor@123', 10),
      employeeId: 'AUDIT-002',
      role: 'AUDITOR',
      isApproved: true,
      isActive: true
    });

    await User.insertMany(users);
    console.log(`✓ Created ${users.length} users\n`);

    /****** Summary ******/
    console.log('******************************************');
    console.log('DATABASE SETUP COMPLETE');
    console.log('******************************************\n');

    console.log('DEPARTMENTS (All Pending - awaiting approval):');
    console.log('  1. Finance Department (FIN)');
    console.log('  2. Disaster Management Department (DM)');
    console.log('  3. Weather (Meteorology) Department (MET)');
    console.log('  4. Agriculture Department (AGRI)');
    console.log('  5. Infrastructure Department (INFRA)\n');

    console.log('USERS CREATED:');
    console.log('  • 1 Super Admin (active)');
    console.log('  • 5 Department Admins (pending)');
    console.log('  • 10 Officers (pending)');
    console.log('  • 2 Auditors (active)\n');

    console.log('NEXT STEPS:');
    console.log('  1. Login as Super Admin: admin@pravah.gov.in / Admin@2025');
    console.log('  2. Go to Department Registrations tab');
    console.log('  3. Approve the 5 pending departments');
    console.log('  4. Department admins and officers will be activated\n');

    console.log('NOTE: No sample documents created.');
    console.log('Documents will appear when users upload them.\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanSetup();
