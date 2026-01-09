/**
 * Seed Department Registrations
 * Create sample departments with various approval statuses
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./models/Department');

async function seedDepartmentRegistrations() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Sample departments with different statuses
    const sampleDepartments = [
      {
        name: 'Department of Rural Development',
        code: 'DRD',
        contactEmail: 'contact@ruraldevelopment.gov.in',
        contactPhone: '+91-11-23456789',
        address: 'Krishi Bhawan, New Delhi',
        nodalOfficer: {
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@ruraldevelopment.gov.in',
          phone: '+91-98765-43210'
        },
        approvalStatus: 'Pending',
        isActive: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        name: 'Department of Urban Affairs',
        code: 'DUA',
        contactEmail: 'contact@urbanaffairs.gov.in',
        contactPhone: '+91-11-23456790',
        address: 'Nirman Bhawan, New Delhi',
        nodalOfficer: {
          name: 'Priya Sharma',
          email: 'priya.sharma@urbanaffairs.gov.in',
          phone: '+91-98765-43211'
        },
        approvalStatus: 'Pending',
        isActive: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        name: 'Department of Women & Child Development',
        code: 'DWCD',
        contactEmail: 'contact@wcd.gov.in',
        contactPhone: '+91-11-23456791',
        address: 'Shastri Bhawan, New Delhi',
        nodalOfficer: {
          name: 'Sunita Rao',
          email: 'sunita.rao@wcd.gov.in',
          phone: '+91-98765-43212'
        },
        approvalStatus: 'Pending',
        isActive: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        name: 'Department of Sports',
        code: 'DSPT',
        contactEmail: 'contact@sports.gov.in',
        contactPhone: '+91-11-23456792',
        address: 'Shastri Bhawan, New Delhi',
        nodalOfficer: {
          name: 'Amit Patel',
          email: 'amit.patel@sports.gov.in',
          phone: '+91-98765-43213'
        },
        approvalStatus: 'Approved',
        isActive: true,
        approvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Department of Culture',
        code: 'DCUL',
        contactEmail: 'contact@culture.gov.in',
        contactPhone: '+91-11-23456793',
        address: 'Shastri Bhawan, New Delhi',
        nodalOfficer: {
          name: 'Meera Nair',
          email: 'meera.nair@culture.gov.in',
          phone: '+91-98765-43214'
        },
        approvalStatus: 'Approved',
        isActive: true,
        approvedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Department of Tourism (Old)',
        code: 'DTO',
        contactEmail: 'contact@tourism-old.gov.in',
        contactPhone: '+91-11-23456794',
        address: 'Transport Bhawan, New Delhi',
        nodalOfficer: {
          name: 'Vikram Singh',
          email: 'vikram.singh@tourism-old.gov.in',
          phone: '+91-98765-43215'
        },
        approvalStatus: 'Rejected',
        isActive: false,
        rejectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Department of Mining (Duplicate)',
        code: 'DM2',
        contactEmail: 'contact@mining2.gov.in',
        contactPhone: '+91-11-23456795',
        address: 'Shram Shakti Bhawan, New Delhi',
        nodalOfficer: {
          name: 'Anil Gupta',
          email: 'anil.gupta@mining2.gov.in',
          phone: '+91-98765-43216'
        },
        approvalStatus: 'Rejected',
        isActive: false,
        rejectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      }
    ];

    console.log('Creating sample department registrations...\n');

    // Check if departments with these codes already exist
    for (const dept of sampleDepartments) {
      const exists = await Department.findOne({ code: dept.code });
      if (exists) {
        console.log(`  Updating existing: ${dept.name} (${dept.code}) - ${dept.approvalStatus}`);
        await Department.updateOne({ code: dept.code }, dept);
      } else {
        console.log(`  Creating new: ${dept.name} (${dept.code}) - ${dept.approvalStatus}`);
        await Department.create(dept);
      }
    }

    console.log('\n✅ Department registrations seeded successfully!\n');

    // Show summary
    const summary = await Department.aggregate([
      { $group: { _id: '$approvalStatus', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('Department Status Summary:');
    summary.forEach(s => console.log(`  ${s._id}: ${s.count}`));
    console.log('');

    console.log('🎉 Refresh your dashboard to see the registrations!\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding department registrations:', error);
    process.exit(1);
  }
}

seedDepartmentRegistrations();
