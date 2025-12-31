/**
 * Create Disaster Management Department Admin User
 * Run: node createDisasterAdmin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Department = require('./models/Department');

async function createDisasterAdmin() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    // Find Disaster Management Department
    const disasterDept = await Department.findOne({ code: 'DIS' });
    
    if (!disasterDept) {
      console.log('❌ Disaster Management department not found!');
      process.exit(1);
    }

    console.log(`✅ Found department: ${disasterDept.name} (${disasterDept.code})`);

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'disaster.admin@pravah.gov.in' });
    
    if (existingUser) {
      console.log('⚠️  User already exists!');
      console.log('-----------------------------------');
      console.log('📧 Email: disaster.admin@pravah.gov.in');
      console.log('👤 Name: Vikram Rao (Disaster Admin)');
      console.log('🏢 Department: Disaster Management');
      console.log('👔 Role:', existingUser.role);
      console.log('🆔 Employee ID:', existingUser.employeeId);
      console.log('-----------------------------------');
      
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash('Disaster@123', 10);
      
      const disasterAdmin = new User({
        firstName: 'Vikram',
        lastName: 'Rao',
        email: 'disaster.admin@pravah.gov.in',
        password: hashedPassword,
        employeeId: 'DIS-001',
        department: disasterDept._id,
        role: 'DEPARTMENT_ADMIN',
        phoneNumber: '+91-9876543214',
        verified: true
      });

      await disasterAdmin.save();

      console.log('✅ Disaster Management Admin created successfully!');
      console.log('-----------------------------------');
      console.log('📧 Email: disaster.admin@pravah.gov.in');
      console.log('🔑 Password: Disaster@123');
      console.log('👤 Name: Vikram Rao');
      console.log('🏢 Department: Disaster Management');
      console.log('👔 Role: DEPARTMENT_ADMIN');
      console.log('🆔 Employee ID: DIS-001');
      console.log('-----------------------------------');
    }

    console.log('\n📝 Login Instructions:');
    console.log('1. Go to: http://localhost:3002');
    console.log('2. Click "Login"');
    console.log('3. Email: disaster.admin@pravah.gov.in');
    console.log('4. Password: Disaster@123');
    console.log('\n🎉 Setup completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating disaster admin:', error);
    process.exit(1);
  }
}

// Run
createDisasterAdmin();
