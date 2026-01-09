/****** Email Notification Service Module which sends email notifications to users about document routing ******/

const nodemailer = require('nodemailer');

/****** Creating a transporter using Gmail ******/
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || process.env.GMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.GMAIL_PASS
  }
});

/****** Send document assignment notification ******/
const sendDocumentAssignment = async (to, document, assignedBy) => {
  try {
    const mailOptions = {
      from: `"Pravaah" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      replyTo: 'noreply@pravaah.gov.in',
      to: to,
      subject: `New Document Assigned: ${document.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                  
                  <!-- Logo Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px 40px; border-bottom: 1px solid #f0f0f0;">
                      <h1 style="margin: 0; color: #0f5e59; font-size: 24px; font-weight: 400; letter-spacing: 1px;">Pravaah</h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1a1a1a; margin: 0 0 8px 0; font-size: 22px; font-weight: 600; line-height: 1.3;">New Document Assignment</h2>
                      <p style="color: #666; font-size: 14px; margin: 0 0 28px 0;">Document requires your review and action</p>

                      <!-- Document Info -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-left: 3px solid #0f5e59; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding-bottom: 16px;">
                                  <p style="margin: 0 0 4px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Document Title</p>
                                  <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">${document.title}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 12px;">
                                  <p style="margin: 0 0 4px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Reference ID</p>
                                  <p style="margin: 0; color: #4a4a4a; font-size: 14px; font-family: monospace;">PRAVAH-${document._id.toString().slice(-8).toUpperCase()}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 12px;">
                                  <p style="margin: 0 0 4px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Department</p>
                                  <p style="margin: 0; color: #4a4a4a; font-size: 14px; text-transform: capitalize;">${document.category}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 12px;">
                                  <p style="margin: 0 0 4px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Priority Level</p>
                                  <p style="margin: 0; color: ${document.urgency === 'High' ? '#c62828' : document.urgency === 'Medium' ? '#f57c00' : '#388e3c'}; font-size: 14px; font-weight: 500;">${document.urgency}</p>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <p style="margin: 0 0 4px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Assigned By</p>
                                  <p style="margin: 0; color: #4a4a4a; font-size: 14px;">${assignedBy}</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0 0 0;">
                        <tr>
                          <td>
                            <a href="${process.env.APP_URL || 'http://localhost:3000'}/document/${document._id}" 
                               style="background-color: #0f5e59; color: #ffffff; padding: 14px 28px; text-decoration: none; display: inline-block; font-size: 15px; font-weight: 500; border-radius: 4px;">
                              View Document
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 32px 40px; border-top: 1px solid #f0f0f0;">
                      <p style="margin: 0 0 16px 0; color: #666; font-size: 13px; line-height: 1.5;">
                        This is an automated message. Please do not reply to this email.
                      </p>
                      <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.5;">
                        Government of Uttarakhand<br/>
                        Pravaah Document Management System
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error.message);
    return { success: false, error: error.message };
  }
};

/****** Send document status update notification ******/
const sendStatusUpdate = async (to, document, status, comment) => {
  try {
    const statusColors = {
      'Approved': { color: '#2e7d32' },
      'Rejected': { color: '#c62828' },
      'In_Progress': { color: '#f57c00' },
      'Pending': { color: '#1565c0' }
    };
    const statusStyle = statusColors[status] || { color: '#666' };

    const mailOptions = {
      from: `"Pravaah" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      replyTo: 'noreply@pravaah.gov.in',
      to: to,
      subject: `Document ${status}: ${document.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                  
                  <!-- Logo Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px 40px; border-bottom: 1px solid #f0f0f0;">
                      <h1 style="margin: 0; color: #0f5e59; font-size: 24px; font-weight: 400; letter-spacing: 1px;">Pravaah</h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1a1a1a; margin: 0 0 8px 0; font-size: 22px; font-weight: 600; line-height: 1.3;">${status === 'Approved' ? 'Document Approved' : status === 'Rejected' ? 'Document Rejected' : 'Document Status Update'}</h2>
                      <p style="color: #666; font-size: 14px; margin: 0 0 28px 0;">${status === 'Approved' ? 'Action completed successfully' : status === 'Rejected' ? 'Document has been declined' : 'Status changed to ' + status}</p>

                      <!-- Status Badge -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                        <tr>
                          <td style="padding: 12px 20px; background-color: ${status === 'Approved' ? '#e8f5e9' : status === 'Rejected' ? '#ffebee' : '#fff4e6'}; border-left: 4px solid ${statusStyle.color};">
                            <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Current Status</p>
                            <p style="margin: 4px 0 0 0; color: ${statusStyle.color}; font-size: 16px; font-weight: 600;">${status}</p>
                          </td>
                        </tr>
                      </table>

                      <!-- Document Info -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-left: 3px solid ${statusStyle.color}; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding-bottom: 12px;">
                                  <p style="margin: 0 0 4px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Document Title</p>
                                  <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">${document.title}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: ${comment ? '12px' : '0'};">
                                  <p style="margin: 0 0 4px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Reference ID</p>
                                  <p style="margin: 0; color: #4a4a4a; font-size: 14px; font-family: monospace;">PRAVAAH-${document._id.toString().slice(-8).toUpperCase()}</p>
                                </td>
                              </tr>
                              ${comment ? `
                              <tr>
                                <td>
                                  <p style="margin: 0 0 4px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${status === 'Approved' ? 'Approval Remarks' : status === 'Rejected' ? 'Rejection Remarks' : 'Officer Remarks'}</p>
                                  <p style="margin: 0; color: #4a4a4a; font-size: 14px; line-height: 1.5;">${comment}</p>
                                </td>
                              </tr>
                              ` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0 0 0;">
                        <tr>
                          <td>
                            <a href="${process.env.APP_URL || 'http://localhost:3000'}/document/${document._id}" 
                               style="background-color: #0f5e59; color: #ffffff; padding: 14px 28px; text-decoration: none; display: inline-block; font-size: 15px; font-weight: 500; border-radius: 4px;">
                              View Document Details
                            </a>
                            <p style="margin: 8px 0 0 0; color: #999; font-size: 12px;">Login required. All access is logged.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 32px 40px; border-top: 1px solid #f0f0f0;">
                      <p style="margin: 0 0 12px 0; color: #666; font-size: 13px; line-height: 1.5;">
                        This is an automated system-generated notification from<br/>
                        <strong>PRAVAAH</strong> – Uttarakhand Government Document Flow System
                      </p>
                      <p style="margin: 0 0 12px 0; color: #d32f2f; font-size: 13px; font-weight: 600;">
                        DO NOT REPLY TO THIS EMAIL
                      </p>
                      <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.5;">
                        For assistance, contact your Department Administrator<br/>
                        © Government of Uttarakhand, 2025
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error.message);
    return { success: false, error: error.message };
  }
};

/****** Send routing notification to department ******/
const sendRoutingNotification = async (to, document, department, routedBy) => {
  try {
    const mailOptions = {
      from: `"PRAVAAH - Govt of Uttarakhand (No-Reply)" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      replyTo: 'noreply@pravaah.gov.in',
      to: to,
      subject: `Document Routed to ${department.name} - Ref: ${document._id.toString().slice(-8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>PRAVAAH Notification</title>
        </head>
        <body style="margin:0; padding:0; background-color:#ffffff; font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:1.6; color:#202124;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="padding:24px;">

                  <tr>
                    <td style="padding-bottom:16px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin:0; font-size:16px; font-weight:bold;">PRAVAAH – Government of Uttarakhand</p>
                            <p style="margin:4px 0 0; color:#5f6368; font-size:12px;">Integrated Government Document Flow System</p>
                          </td>
                          <td align="right" style="vertical-align:middle;">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/60px-Emblem_of_India.svg.png" alt="Government of India" width="40" height="40" style="display:block; vertical-align:middle;" />
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="border-top:1px solid #e0e0e0; padding-top:16px;"></td>
                  </tr>

                  <tr>
                    <td style="padding-top:16px;">
                      <p style="margin:0;">Dear Officer,</p>
                      <p style="margin:16px 0;">This is to inform you that a document has been <strong>routed to your department</strong> through the PRAVAAH system.</p>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0; margin:16px 0;">
                        
                        <tr style="background-color:#f8f9fa;">
                          <td colspan="2" style="padding:10px; font-weight:bold;">Document Details</td>
                        </tr>

                        <tr>
                          <td style="padding:8px 10px; color:#5f6368; width:35%;">Title</td>
                          <td style="padding:8px 10px;"><strong>${document.title}</strong></td>
                        </tr>

                        <tr>
                          <td style="padding:8px 10px; color:#5f6368;">Reference ID</td>
                          <td style="padding:8px 10px;"><code>PRAVAAH-${document._id.toString().slice(-8).toUpperCase()}</code></td>
                        </tr>

                        <tr>
                          <td style="padding:8px 10px; color:#5f6368;">Category</td>
                          <td style="padding:8px 10px;">${document.category}</td>
                        </tr>

                        <tr>
                          <td style="padding:8px 10px; color:#5f6368;">Priority</td>
                          <td style="padding:8px 10px;"><strong>${document.urgency}</strong></td>
                        </tr>

                        <tr>
                          <td style="padding:8px 10px; color:#5f6368;">Routed By</td>
                          <td style="padding:8px 10px;">${routedBy}</td>
                        </tr>

                        <tr>
                          <td style="padding:8px 10px; color:#5f6368;">Assigned To</td>
                          <td style="padding:8px 10px;"><strong>${department.name}</strong> (${department.code})</td>
                        </tr>

                        <tr>
                          <td style="padding:8px 10px; color:#5f6368;">Routed On</td>
                          <td style="padding:8px 10px;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                        </tr>

                      </table>
                    </td>
                  </tr>

                  ${document.summary ? `
                  <tr>
                    <td>
                      <p style="margin:16px 0 8px; font-weight:bold; color:#202124;">Summary</p>
                      <p style="margin:0 0 16px; color:#5f6368;">${document.summary}</p>
                    </td>
                  </tr>
                  ` : ''}

                  ${document.keyPoints && document.keyPoints.length > 0 ? `
                  <tr>
                    <td>
                      <p style="margin:16px 0 8px; font-weight:bold; color:#202124;">Key Points</p>
                      <ul style="margin:0 0 16px; padding-left:20px; color:#5f6368;">
                        ${document.keyPoints.map(point => `<li style="margin-bottom:4px;">${point}</li>`).join('')}
                      </ul>
                    </td>
                  </tr>
                  ` : ''}

                  <tr>
                    <td>
                      <p style="margin:16px 0;">Please sign in to the PRAVAAH portal to review the document and take necessary action.</p>
                      <p style="margin:8px 0;"><a href="${process.env.APP_URL || 'http://localhost:3002'}/document/${document._id}" style="color:#1a73e8; text-decoration:none;">View document in PRAVAAH</a></p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding-top:24px; border-top:1px solid #e0e0e0;">
                      <p style="margin:8px 0; color:#5f6368; font-size:12px;">This is an automated system-generated email. Please do not reply.</p>
                      <p style="margin:0; color:#5f6368; font-size:12px;">For assistance, contact your Department Administrator.</p>
                      <p style="margin-top:12px; color:#80868b; font-size:11px;">© Government of Uttarakhand · PRAVAAH System</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Routing email sent to ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendDocumentAssignment,
  sendStatusUpdate,
  sendRoutingNotification
};
