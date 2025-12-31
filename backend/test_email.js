require('dotenv').config();
const { sendDocumentAssignment, sendStatusUpdate } = require('./services/emailService');

async function testEmail() {
  console.log('📧 Testing Pravah Email System...\n');
  
  // Test document data
  const testDocument = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Document - Budget Approval Request',
    category: 'finance',
    urgency: 'High',
    referenceNumber: 'DOC-TEST-2025-001'
  };

  const assignedBy = 'System Administrator';
  
  console.log('📤 Sending test assignment email to: ankurawat8844@gmail.com');
  console.log('📄 Document:', testDocument.title);
  console.log('⚡ Urgency:', testDocument.urgency);
  console.log('\n⏳ Sending...\n');

  try {
    // Send assignment email
    const result = await sendDocumentAssignment(
      'ankurawat8844@gmail.com',
      testDocument,
      assignedBy
    );

    if (result.success) {
      console.log('✅ SUCCESS! Test email sent successfully!');
      console.log('📬 Message ID:', result.messageId);
      console.log('\n💡 Check your inbox at: ankurawat8844@gmail.com');
      console.log('📁 Check spam folder if not in inbox');
      
      // Send status update email after 2 seconds
      console.log('\n⏳ Sending status update email in 2 seconds...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResult = await sendStatusUpdate(
        'ankurawat8844@gmail.com',
        testDocument,
        'Approved',
        'Document approved after review. Budget allocation confirmed.'
      );
      
      if (statusResult.success) {
        console.log('✅ SUCCESS! Status update email sent!');
        console.log('📬 Message ID:', statusResult.messageId);
      }
      
    } else {
      console.log('❌ FAILED to send email');
      console.log('Error:', result.error);
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check .env file has correct email credentials');
    console.error('2. Verify email: pravah.docflow.noreply@gmail.com');
    console.error('3. Verify password is correct');
    console.error('4. Enable "Less secure app access" or use App Password');
  }

  process.exit(0);
}

testEmail();
