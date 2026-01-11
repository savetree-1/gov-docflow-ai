require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing Email Configuration...\n');
  
  console.log('Email Credentials:');
  console.log('  EMAIL_USER:', process.env.EMAIL_USER);
  console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : '❌ MISSING');
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('Email credentials not configured in .env file');
    return;
  }

  try {
    /****** Creating transporter ******/
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    console.log('Verifying transporter connection...');
    await transporter.verify();
    console.log('Transporter connection verified!\n');

    /****** Sending test email ******/
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"Pravaah Document System" <${process.env.EMAIL_USER}>`,
      to: 'ukweatherdept.gov@gmail.com', // UK Weather admin email
      subject: 'Email Service Test - Pravaah System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">Email Service Test</h2>
          <p>This is a test email from the Pravaah Document Management System.</p>
          <p><strong>Status:</strong> Email service is working correctly! ✅</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <hr style="border: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated test email. If you received this, email notifications are configured correctly.
          </p>
        </div>
      `
    });

    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Recipient: ukweatherdept.gov@gmail.com\n');
    console.log('Email service is working! Check the inbox.');

  } catch (error) {
    console.error('Email test failed:', error.message);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
    }
  }
}

testEmail();
