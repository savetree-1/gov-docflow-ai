/****** Module which will create Weather Department Admin User with following email ******/
/****** Email: ukweatherdept.gov@gmail.com and will run: node createWeatherAdmin.js ******/

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

/****** Loading up the environment variables ******/
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Department = require('./models/Department');

async function createWeatherAdmin() {
  try {
    /****** Connecting to MongoDB through specified URI ******/
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    /****** Finding the Meteorology Department ******/
    const weatherDept = await Department.findOne({ code: 'MET' });
    
    if (!weatherDept) {
      console.log('Meteorology department not found. Please run seedDepartments.js first!');
      process.exit(1);
    }

    console.log(`Found department: ${weatherDept.name} (${weatherDept.code})`);

    /****** Checking if the user already exists to avoid duplicates ******/
    const existingUser = await User.findOne({ email: 'ukweatherdept.gov@gmail.com' });
    
    if (existingUser) {
      console.log('User already exists. Updating details...');
      
      existingUser.firstName = 'Weather';
      existingUser.lastName = 'Department Admin';
      existingUser.employeeId = 'UKWD-001';
      existingUser.department = weatherDept._id;
      existingUser.role = 'DEPARTMENT_ADMIN';
      existingUser.phoneNumber = '+91-9876543222';
      
      await existingUser.save();
      
      console.log('User updated successfully!');
      console.log('-----------------------------------');
      console.log('Email: ukweatherdept.gov@gmail.com');
      console.log('Name: Weather Department Admin');
      console.log('Department: Meteorology');
      console.log('Role: DEPARTMENT_ADMIN');
      console.log('Employee ID: UKWD-001');
      console.log('Password: (unchanged)');
      console.log('-----------------------------------');
      
    } else {
      /****** Creating a new user ******/
      const hashedPassword = await bcrypt.hash('Weather@123', 10);
      
      const weatherAdmin = new User({
        firstName: 'Weather',
        lastName: 'Department Admin',
        email: 'ukweatherdept.gov@gmail.com',
        password: hashedPassword,
        employeeId: 'UKWD-001',
        department: weatherDept._id,
        role: 'DEPARTMENT_ADMIN',
        phoneNumber: '+91-9876543222',
        verified: true
      });

      await weatherAdmin.save();

      console.log('Weather Department Admin created successfully!');
      console.log('-----------------------------------');
      console.log('Email: ukweatherdept.gov@gmail.com');
      console.log('Password: Weather@123');
      console.log('Name: Weather Department Admin');
      console.log('Department: Meteorology');
      console.log('Role: DEPARTMENT_ADMIN');
      console.log('Employee ID: UKWD-001');
      console.log('-----------------------------------');
    }

    console.log('\nImportant Notes:');
    console.log('1. This email will receive notifications when documents are routed to Meteorology dept');
    console.log('2. AI will suggest "Disaster Management" or "Meteorology" for weather-related documents');
    console.log('3. Login with: ukweatherdept.gov@gmail.com / Weather@123');
    console.log('4. Check this Gmail inbox for email notifications\n');

    console.log('Setup completed!');
    process.exit(0);

  } catch (error) {
    console.error('Error creating weather admin:', error);
    process.exit(1);
  }
}

/****** Runing the function to create Weather Admin ******/
createWeatherAdmin();
