const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Department = require('./models/Department');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Testing the users data
const testUsers = [
  // SUPER ADMIN (1)
  {
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@pravah.gov.in',
    password: 'Admin@2025',
    employeeId: 'ADMIN001',
    role: 'SUPER_ADMIN',
    isApproved: true,
    isActive: true
  },
  
  // DEPARTMENT ADMINS (5)
  {
    firstName: 'Finance',
    lastName: 'Admin',
    email: 'finance.admin@pravah.gov.in',
    password: 'Finance@123',
    employeeId: 'FIN-ADMIN',
    role: 'DEPARTMENT_ADMIN',
    isApproved: true,
    isActive: true
  },
  {
    firstName: 'Disaster',
    lastName: 'Admin',
    email: 'disaster.admin@pravah.gov.in',
    password: 'Disaster@123',
    employeeId: 'DIS-ADMIN',
    role: 'DEPARTMENT_ADMIN',
    isApproved: true,
    isActive: true
  },
  {
    firstName: 'Weather',
    lastName: 'Admin',
    email: 'ukweatherdept.gov@gmail.com',
    password: 'Weather@123',
    employeeId: 'WEA-ADMIN',
    role: 'DEPARTMENT_ADMIN',
    isApproved: true,
    isActive: true
  },
  {
    firstName: 'Agriculture',
    lastName: 'Admin',
    email: 'agriculture.admin@pravah.gov.in',
    password: 'Agri@123',
    employeeId: 'AGR-ADMIN',
    role: 'DEPARTMENT_ADMIN',
    isApproved: true,
    isActive: true
  },
  {
    firstName: 'Infrastructure',
    lastName: 'Admin',
    email: 'infra.admin@pravah.gov.in',
    password: 'Infra@123',
    employeeId: 'INF-ADMIN',
    role: 'DEPARTMENT_ADMIN',
    isApproved: true,
    isActive: true
  },
  
  // OFFICERS (10 - 2 per department)
  // Finance Department
  {
    firstName: 'Suresh',
    lastName: 'Patel',
    email: 'finance.officer1@pravah.gov.in',
    password: 'Officer@123',
    employeeId: 'FIN-OFF-001',
    role: 'OFFICER',
    isApproved: true,
    isActive: true
  },
  {
    firstName: 'Meena',
    lastName: 'Gupta',
    email: 'finance.officer2@pravah.gov.in',
    password: 'Officer@123',
    employeeId: 'FIN-OFF-002',
    role: 'OFFICER',
    isApproved: true,
    isActive: true
  },
  
  // Disaster Management
  {
    firstName: 'Anil',
    lastName: 'Singh',
    email: 'disaster.officer1@pravah.gov.in',
    password: 'Officer@123',
    employeeId: 'DIS-OFF-001',
    role: 'OFFICER',
    isApproved: true,
    isActive: true
  },
  {
    firstName: 'Pooja',
    lastName: 'Reddy',
    email: 'disaster.officer2@pravah.gov.in',
    password: 'Officer@123',
    employeeId: 'DIS-OFF-002',
    role: 'OFFICER',
    isApproved: true,
    isActive: true
  },
  
  // Weather (Meteorology)
  {
    firstName: 'Deepak',
    lastName: 'Joshi',
    email: 'weather.officer1@pravah.gov.in',
    password: 'Officer@123',
    employeeId: 'WEA-OFF-001',
    role: 'OFFICER',
    isApproved: true,
    isActive: true
  },
  {
    firstName: 'Sneha',
    lastName: 'Nair',
    email: 'weather.officer2@pravah.gov.in',
    password: 'Officer@123',
    employeeId: 'WEA-OFF-002',
    role: 'OFFICER',
    isApproved: true,
    isActive: true
  },
  
  // Agriculture
  {
    firstName: 'Ravi',
    lastName: 'Yadav',
    email: 'agri.officer1@pravah.gov.in',
    password: 'Officer@123',
    employeeId: 'AGR-OFF-001',
    role: 'OFFICER',
    isApproved: true,
    isActive: true
  },
  {
    firstName: 'Kavita',
    lastName: 'Desai',
    email: 'agri.officer2@pravah.gov.in',
    password: 'Officer@123',
    employeeId: 'AGR-OFF-002',
    role: 'OFFICER',
    isApproved: true,
    isActive: true
  },
  
  // Infrastructure
  {
    firstName: 'Sanjay',
    lastName: 'Malhotra',
    email: 'infra.officer1@pravah.gov.in',
    password: 'Officer@123',
    employeeId: 'INF-OFF-001',
    role: 'OFFICER',
    isApproved: true,
    isActive: true
  },
  {
    firstName: 'Anjali',
    lastName: 'Mehta',
    email: 'infra.officer2@pravah.gov.in',
    password: 'Officer@123',
    employeeId: 'INF-OFF-002',
    role: 'OFFICER',
    isApproved: true,
    isActive: true
  },
  
  // AUDITORS (2)
  {
    firstName: 'Ramesh',
    lastName: 'Iyer',
    email: 'auditor1@pravah.gov.in',
    password: 'Auditor@123',
    employeeId: 'AUD-001',
    role: 'AUDITOR',
    isApproved: true,
    isActive: true
  },
  {
    firstName: 'Lakshmi',
    lastName: 'Bhat',
    email: 'auditor2@pravah.gov.in',
    password: 'Auditor@123',
    employeeId: 'AUD-002',
    role: 'AUDITOR',
    isApproved: true,
    isActive: true
  }
];

// Test departments
const testDepartments = [
  {
    name: 'Finance Department',
    code: 'FIN',
    nodalOfficer: {
      name: 'Finance Admin',
      email: 'finance.admin@pravah.gov.in',
      phone: '+91-9876543210',
      designation: 'Head of Finance'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Disaster Management Department',
    code: 'DIS',
    nodalOfficer: {
      name: 'Disaster Admin',
      email: 'disaster.admin@pravah.gov.in',
      phone: '+91-9876543211',
      designation: 'Head of Disaster Management'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Weather & Meteorology Department',
    code: 'WEA',
    nodalOfficer: {
      name: 'Weather Admin',
      email: 'ukweatherdept.gov@gmail.com',
      phone: '+91-9876543212',
      designation: 'Chief Meteorologist'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Agriculture Department',
    code: 'AGR',
    nodalOfficer: {
      name: 'Agriculture Admin',
      email: 'agriculture.admin@pravah.gov.in',
      phone: '+91-9876543213',
      designation: 'Head of Agriculture'
    },
    status: 'Approved',
    isActive: true
  },
  {
    name: 'Infrastructure Department',
    code: 'INF',
    nodalOfficer: {
      name: 'Infrastructure Admin',
      email: 'infra.admin@pravah.gov.in',
      phone: '+91-9876543214',
      designation: 'Head of Infrastructure'
    },
    status: 'Approved',
    isActive: true
  }
];

async function seedDatabase() {
  try {
    console.log('\nStarting database seeding...\n');

    // Clearing existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Department.deleteMany({});
    console.log('Existing data cleared\n');

    // Creating departments
    console.log(' Creating departments...');
    const departments = await Department.insertMany(testDepartments);
    console.log(`Created ${departments.length} departments\n`);

    // Creating users and link to departments
    console.log(' Creating users...');
    const usersToCreate = [];

    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      let departmentId = null;
      
      // Assigning department admins to their respective departments
      if (userData.role === 'DEPARTMENT_ADMIN') {
        if (userData.email === 'finance.admin@pravah.gov.in') {
          departmentId = departments.find(d => d.code === 'FIN')._id;
        } else if (userData.email === 'disaster.admin@pravah.gov.in') {
          departmentId = departments.find(d => d.code === 'DIS')._id;
        } else if (userData.email === 'ukweatherdept.gov@gmail.com') {
          departmentId = departments.find(d => d.code === 'WEA')._id;
        } else if (userData.email === 'agriculture.admin@pravah.gov.in') {
          departmentId = departments.find(d => d.code === 'AGR')._id;
        } else if (userData.email === 'infra.admin@pravah.gov.in') {
          departmentId = departments.find(d => d.code === 'INF')._id;
        }
      } 
      // Assigning officers to their respective departments based on employee ID prefix
      else if (userData.role === 'OFFICER') {
        if (userData.employeeId.startsWith('FIN-')) {
          departmentId = departments.find(d => d.code === 'FIN')._id;
        } else if (userData.employeeId.startsWith('DIS-')) {
          departmentId = departments.find(d => d.code === 'DIS')._id;
        } else if (userData.employeeId.startsWith('WEA-')) {
          departmentId = departments.find(d => d.code === 'WEA')._id;
        } else if (userData.employeeId.startsWith('AGR-')) {
          departmentId = departments.find(d => d.code === 'AGR')._id;
        } else if (userData.employeeId.startsWith('INF-')) {
          departmentId = departments.find(d => d.code === 'INF')._id;
        }
      }

      usersToCreate.push({
        ...userData,
        password: hashedPassword,
        department: departmentId
      });
    }

    const users = await User.insertMany(usersToCreate);
    console.log(`Created ${users.length} users\n`);

    // Displaying out the login credentials
    console.log('Login Credentials:\n');
    console.log('=' .repeat(80));
    console.log('Role\t\t\tEmail\t\t\t\tPassword');
    console.log('='.repeat(80));
    testUsers.forEach(user => {
      console.log(`${user.role.padEnd(20)}\t${user.email.padEnd(20)}\t${user.password}`);
    });
    console.log('='.repeat(80));
    console.log('\nDatabase seeding completed successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Runing the seeding function
seedDatabase();
