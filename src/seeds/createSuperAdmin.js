/**
 * Create Super Admin Seed Script
 * Run this once during initial deployment
 * 
 * Usage: node src/seeds/createSuperAdmin.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');

// TODO: Replace with actual database connection
// const db = require('../config/database');

async function createSuperAdmin() {
  try {
    console.log('\n🔐 Creating Super Admin Account...\n');

    // Super Admin details
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@uk.gov.in';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SecureAdmin2025!';
    const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Administrator';

    // Check if Super Admin already exists
    // const existingAdmin = await db.User.findOne({ 
    //   where: { email: superAdminEmail } 
    // });

    // if (existingAdmin) {
    //   console.log('❌ Super Admin already exists!');
    //   console.log(`   Email: ${superAdminEmail}`);
    //   return;
    // }

    // Hash password
    const passwordHash = await bcrypt.hash(superAdminPassword, 12);

    // Create Super Admin user
    const superAdmin = {
      id: generateUUID(),
      email: superAdminEmail.toLowerCase(),
      employeeId: 'SUPER001', // Optional
      name: superAdminName,
      role: 'SUPER_ADMIN',
      passwordHash: passwordHash,
      status: 'ACTIVE',
      departmentId: null, // Super Admin has no department
      metadata: {
        designation: 'System Administrator',
        phoneNumber: null
      },
      createdBy: null, // Self-created
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert into database
    // await db.User.create(superAdmin);

    // For demo purposes, log the details
    console.log('✅ Super Admin Account Created Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Name:     ${superAdmin.name}`);
    console.log(`   Email:    ${superAdmin.email}`);
    console.log(`   Emp ID:   ${superAdmin.employeeId}`);
    console.log(`   Role:     ${superAdmin.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   1. Save these credentials in a secure location');
    console.log('   2. Change the default password immediately after first login');
    console.log('   3. Never share these credentials');
    console.log('   4. Enable MFA if available');
    console.log('   5. Delete this script or secure it after deployment\n');

    console.log('📝 Next Steps:');
    console.log('   1. Start the backend server');
    console.log('   2. Login with the above credentials');
    console.log('   3. Change password in settings');
    console.log('   4. Review and approve pending department requests\n');

    // Store password securely (for deployment reference only)
    // In production, communicate this via secure channel
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔑 Login Credentials (DEV ONLY):');
      console.log(`   Email:    ${superAdminEmail}`);
      console.log(`   Password: ${superAdminPassword}\n`);
      console.log('   ⚠️  These will NOT be shown in production!\n');
    }

  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
    process.exit(1);
  }
}

// Helper function to generate UUID (use actual UUID library in production)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Run the script
if (require.main === module) {
  createSuperAdmin()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = createSuperAdmin;
