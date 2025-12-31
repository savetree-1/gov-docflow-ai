const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const Department = require('./models/Department');
  
  console.log('🗑️  Deleting all existing users...');
  await User.deleteMany({});
  console.log('✅ All users deleted\n');

  // Fetch departments
  const finance = await Department.findOne({ code: 'FIN' });
  const disaster = await Department.findOne({ code: 'DIS' });
  const meteorology = await Department.findOne({ code: 'MET' });
  const agriculture = await Department.findOne({ code: 'AGR' });
  const infrastructure = await Department.findOne({ code: 'INF' });

  const users = [];

  // ===== SUPER ADMIN =====
  console.log('Creating Super Admin...');
  users.push({
    email: 'admin@pravah.gov.in',
    password: await bcrypt.hash('Admin@2025', 10),
    firstName: 'System',
    lastName: 'Administrator',
    role: 'SUPER_ADMIN',
    employeeId: 'ADMIN-001',
    phone: '+91-1234567890',
    isActive: true,
    isApproved: true
  });

  // ===== DEPARTMENT ADMINS =====
  console.log('Creating Department Admins...');
  
  // Finance Department Admin
  users.push({
    email: 'finance.admin@pravah.gov.in',
    password: await bcrypt.hash('Finance@123', 10),
    firstName: 'Rajesh',
    lastName: 'Kumar',
    role: 'DEPARTMENT_ADMIN',
    department: finance._id,
    employeeId: 'FIN-ADMIN-001',
    phone: '+91-9876543210',
    isActive: true,
    isVerified: true
  });

  // Disaster Management Admin
  users.push({
    email: 'disaster.admin@pravah.gov.in',
    password: await bcrypt.hash('Disaster@123', 10),
    firstName: 'Vikram',
    lastName: 'Rao',
    role: 'DEPARTMENT_ADMIN',
    department: disaster._id,
    employeeId: 'DIS-ADMIN-001',
    phone: '+91-9876543214',
    isActive: true,
    isVerified: true
  });

  // Weather Department Admin (Real Gmail)
  users.push({
    email: 'ukweatherdept.gov@gmail.com',
    password: await bcrypt.hash('Weather@123', 10),
    firstName: 'Weather Department',
    lastName: 'Admin',
    role: 'DEPARTMENT_ADMIN',
    department: meteorology._id,
    employeeId: 'MET-ADMIN-001',
    phone: '+91-9876543215',
    isActive: true,
    isVerified: true
  });

  // Agriculture Department Admin
  users.push({
    email: 'agriculture.admin@pravah.gov.in',
    password: await bcrypt.hash('Agri@123', 10),
    firstName: 'Priya',
    lastName: 'Sharma',
    role: 'DEPARTMENT_ADMIN',
    department: agriculture._id,
    employeeId: 'AGR-ADMIN-001',
    phone: '+91-9876543216',
    isActive: true,
    isVerified: true
  });

  // Infrastructure Department Admin
  users.push({
    email: 'infra.admin@pravah.gov.in',
    password: await bcrypt.hash('Infra@123', 10),
    firstName: 'Amit',
    lastName: 'Verma',
    role: 'DEPARTMENT_ADMIN',
    department: infrastructure._id,
    employeeId: 'INF-ADMIN-001',
    phone: '+91-9876543217',
    isActive: true,
    isVerified: true
  });

  // ===== OFFICERS =====
  console.log('Creating Officers...');

  // Finance Officers
  users.push({
    email: 'finance.officer1@pravah.gov.in',
    password: await bcrypt.hash('Officer@123', 10),
    firstName: 'Suresh',
    lastName: 'Patel',
    role: 'OFFICER',
    department: finance._id,
    employeeId: 'FIN-OFF-001',
    phone: '+91-9123456701',
    isActive: true,
    isVerified: true
  });

  users.push({
    email: 'finance.officer2@pravah.gov.in',
    password: await bcrypt.hash('Officer@123', 10),
    firstName: 'Meena',
    lastName: 'Gupta',
    role: 'OFFICER',
    department: finance._id,
    employeeId: 'FIN-OFF-002',
    phone: '+91-9123456702',
    isActive: true,
    isVerified: true
  });

  // Disaster Management Officers
  users.push({
    email: 'disaster.officer1@pravah.gov.in',
    password: await bcrypt.hash('Officer@123', 10),
    firstName: 'Anil',
    lastName: 'Singh',
    role: 'OFFICER',
    department: disaster._id,
    employeeId: 'DIS-OFF-001',
    phone: '+91-9123456703',
    isActive: true,
    isVerified: true
  });

  users.push({
    email: 'disaster.officer2@pravah.gov.in',
    password: await bcrypt.hash('Officer@123', 10),
    firstName: 'Pooja',
    lastName: 'Reddy',
    role: 'OFFICER',
    department: disaster._id,
    employeeId: 'DIS-OFF-002',
    phone: '+91-9123456704',
    isActive: true,
    isVerified: true
  });

  // Weather Officers
  users.push({
    email: 'weather.officer1@pravah.gov.in',
    password: await bcrypt.hash('Officer@123', 10),
    firstName: 'Deepak',
    lastName: 'Joshi',
    role: 'OFFICER',
    department: meteorology._id,
    employeeId: 'MET-OFF-001',
    phone: '+91-9123456705',
    isActive: true,
    isVerified: true
  });

  users.push({
    email: 'weather.officer2@pravah.gov.in',
    password: await bcrypt.hash('Officer@123', 10),
    firstName: 'Sneha',
    lastName: 'Nair',
    role: 'OFFICER',
    department: meteorology._id,
    employeeId: 'MET-OFF-002',
    phone: '+91-9123456706',
    isActive: true,
    isVerified: true
  });

  // Agriculture Officers
  users.push({
    email: 'agri.officer1@pravah.gov.in',
    password: await bcrypt.hash('Officer@123', 10),
    firstName: 'Ravi',
    lastName: 'Yadav',
    role: 'OFFICER',
    department: agriculture._id,
    employeeId: 'AGR-OFF-001',
    phone: '+91-9123456707',
    isActive: true,
    isVerified: true
  });

  users.push({
    email: 'agri.officer2@pravah.gov.in',
    password: await bcrypt.hash('Officer@123', 10),
    firstName: 'Kavita',
    lastName: 'Desai',
    role: 'OFFICER',
    department: agriculture._id,
    employeeId: 'AGR-OFF-002',
    phone: '+91-9123456708',
    isActive: true,
    isVerified: true
  });

  // Infrastructure Officers
  users.push({
    email: 'infra.officer1@pravah.gov.in',
    password: await bcrypt.hash('Officer@123', 10),
    firstName: 'Sanjay',
    lastName: 'Malhotra',
    role: 'OFFICER',
    department: infrastructure._id,
    employeeId: 'INF-OFF-001',
    phone: '+91-9123456709',
    isActive: true,
    isVerified: true
  });

  users.push({
    email: 'infra.officer2@pravah.gov.in',
    password: await bcrypt.hash('Officer@123', 10),
    firstName: 'Anjali',
    lastName: 'Mehta',
    role: 'OFFICER',
    department: infrastructure._id,
    employeeId: 'INF-OFF-002',
    phone: '+91-9123456710',
    isActive: true,
    isVerified: true
  });

  // ===== AUDITORS =====
  console.log('Creating Auditors...');

  users.push({
    email: 'auditor1@pravah.gov.in',
    password: await bcrypt.hash('Auditor@123', 10),
    firstName: 'Ramesh',
    lastName: 'Iyer',
    role: 'AUDITOR',
    employeeId: 'AUD-001',
    phone: '+91-9123456801',
    isActive: true,
    isVerified: true
  });

  users.push({
    email: 'auditor2@pravah.gov.in',
    password: await bcrypt.hash('Auditor@123', 10),
    firstName: 'Lakshmi',
    lastName: 'Bhat',
    role: 'AUDITOR',
    employeeId: 'AUD-002',
    phone: '+91-9123456802',
    isActive: true,
    isVerified: true
  });

  // Insert all users
  await User.insertMany(users);

  console.log('\n✅ USER CREATION COMPLETE!\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('🔑 LOGIN CREDENTIALS:\n');
  
  console.log('⭐ SUPER ADMIN:');
  console.log('   Email: admin@pravah.gov.in');
  console.log('   Password: Admin@2025\n');
  
  console.log('👨‍💼 DEPARTMENT ADMINS:');
  console.log('   Finance: finance.admin@pravah.gov.in / Finance@123');
  console.log('   Disaster: disaster.admin@pravah.gov.in / Disaster@123');
  console.log('   Weather: ukweatherdept.gov@gmail.com / Weather@123 (Real Gmail)');
  console.log('   Agriculture: agriculture.admin@pravah.gov.in / Agri@123');
  console.log('   Infrastructure: infra.admin@pravah.gov.in / Infra@123\n');
  
  console.log('📋 OFFICERS (2 per department):');
  console.log('   Finance: finance.officer1@pravah.gov.in / Officer@123');
  console.log('   Finance: finance.officer2@pravah.gov.in / Officer@123');
  console.log('   Disaster: disaster.officer1@pravah.gov.in / Officer@123');
  console.log('   Disaster: disaster.officer2@pravah.gov.in / Officer@123');
  console.log('   Weather: weather.officer1@pravah.gov.in / Officer@123');
  console.log('   Weather: weather.officer2@pravah.gov.in / Officer@123');
  console.log('   Agriculture: agri.officer1@pravah.gov.in / Officer@123');
  console.log('   Agriculture: agri.officer2@pravah.gov.in / Officer@123');
  console.log('   Infrastructure: infra.officer1@pravah.gov.in / Officer@123');
  console.log('   Infrastructure: infra.officer2@pravah.gov.in / Officer@123\n');
  
  console.log('🔍 AUDITORS:');
  console.log('   Auditor 1: auditor1@pravah.gov.in / Auditor@123');
  console.log('   Auditor 2: auditor2@pravah.gov.in / Auditor@123\n');
  
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`Total Users Created: ${users.length}`);
  console.log('  - 1 Super Admin');
  console.log('  - 5 Department Admins');
  console.log('  - 10 Officers (2 per department)');
  console.log('  - 2 Auditors\n');

  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
