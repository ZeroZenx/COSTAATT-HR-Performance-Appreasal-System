const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USERNAME || process.env.SMTP_USER || 'hr@costaatt.edu.tt',
    pass: process.env.SMTP_PASSWORD || 'XSpjz547',
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false,
  },
});

// Add fallback check for incorrect SMTP host
if (process.env.SMTP_HOST && process.env.SMTP_HOST.includes("gmail.com")) {
  console.warn("⚠️  Warning: Gmail SMTP detected. Please use smtp.office365.com for Office 365");
  // Don't throw error, just warn
}

// Email templates directory
const templatesDir = path.join(__dirname, '../templates/email');

// Load and compile email template
function loadTemplate(templateName) {
  try {
    const templatePath = path.join(templatesDir, `${templateName}.html`);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateSource);
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    return null;
  }
}

// Send email with retry logic
async function sendEmailWithRetry({
  to,
  cc = null,
  subject,
  html,
  type = 'notification',
  attempt = 1,
  templateName = null,
  templateData = {}
}) {
  try {
    // Use template if provided
    if (templateName && templateData) {
      const template = loadTemplate(templateName);
      if (template) {
        html = template(templateData);
      }
    }

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'COSTAATT HR Gateway'}" <${process.env.SMTP_FROM_ADDRESS || 'hr@costaatt.edu.tt'}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    
    // Log successful send
    await prisma.emailLog.create({
      data: {
        to: Array.isArray(to) ? to.join(', ') : to,
        cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : null,
        subject,
        status: 'sent',
        type,
        attempt,
      },
    });

    console.log(`✅ Email sent successfully to ${to} (attempt ${attempt})`);
    return result;

  } catch (error) {
    console.error(`❌ Email send failed (attempt ${attempt}):`, error.message);
    
    const status = attempt < 3 ? 'pending' : 'failed';

    // Log failed send
    await prisma.emailLog.create({
      data: {
        to: Array.isArray(to) ? to.join(', ') : to,
        cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : null,
        subject,
        status,
        type,
        error: error.message,
        attempt,
      },
    });

    // Retry logic
    if (attempt < 3) {
      console.log(`🔄 Retrying email in 10 minutes... (attempt ${attempt + 1}/3)`);
      setTimeout(() => {
        sendEmailWithRetry({
          to,
          cc,
          subject,
          html,
          type,
          attempt: attempt + 1,
          templateName,
          templateData
        });
      }, 10 * 60 * 1000); // Retry in 10 minutes
    } else {
      console.error(`💥 Email failed permanently after 3 attempts to ${to}`);
      
      // Create fallback in-app notification
      await createFallbackNotification({
        to,
        subject,
        type,
        templateData
      });
    }

    throw error;
  }
}

// CC Logic based on user roles and events
function getCCRecipients(eventType, userRole, employeeData = null) {
  const hrEmail = 'hr@costaatt.edu.tt';
  const dheadleyEmail = 'dheadley@costaatt.edu.tt';
  const ccList = [hrEmail, dheadleyEmail]; // HR and DHeadley are always CC'd (visible to all recipients)

  switch (eventType) {
    case 'appraisal_submitted':
      // Employee submits appraisal -> CC HR
      return ccList;

    case 'appraisal_returned':
      // Manager returns appraisal -> CC HR
      return ccList;

    case 'appraisal_approved_by_supervisor':
      // Supervisor approves -> CC HR and find divisional head
      if (employeeData && employeeData.dept) {
        // In a real implementation, you'd query for the divisional head of the department
        // For now, we'll just CC HR
        return ccList;
      }
      return ccList;

    case 'appraisal_finalized':
      // Final approver completes -> CC employee's supervisor and HR
      if (employeeData && employeeData.supervisorEmail) {
        ccList.push(employeeData.supervisorEmail);
      }
      return ccList;

    case 'appraisal_requires_attention':
      // System alert -> CC HR and relevant managers
      return ccList;

    default:
      return ccList;
  }
}

// Send notification email
async function sendNotificationEmail({
  to,
  eventType,
  subject,
  templateName,
  templateData = {},
  cc = null
}) {
  try {
    // Get CC recipients based on event type
    const ccRecipients = cc || getCCRecipients(eventType, templateData.userRole, templateData.employeeData);
    
    await sendEmailWithRetry({
      to,
      cc: ccRecipients,
      subject,
      templateName,
      templateData,
      type: 'notification'
    });

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending notification email:', error);
    return { success: false, message: error.message };
  }
}

// Test email function
async function sendTestEmail({ to, subject, html, cc = null }) {
  try {
    await sendEmailWithRetry({
      to,
      cc,
      subject,
      html,
      type: 'test'
    });

    return { success: true, message: 'Test email sent successfully' };
  } catch (error) {
    console.error('Error sending test email:', error);
    return { success: false, message: error.message };
  }
}

// Get email logs
async function getEmailLogs(limit = 50, offset = 0) {
  try {
    const logs = await prisma.emailLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.emailLog.count();

    return { logs, total };
  } catch (error) {
    console.error('Error fetching email logs:', error);
    throw error;
  }
}

// Retry failed emails
async function retryFailedEmails() {
  try {
    const failedEmails = await prisma.emailLog.findMany({
      where: {
        status: 'pending',
        attempt: { lt: 3 }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`Found ${failedEmails.length} pending emails to retry`);

    for (const emailLog of failedEmails) {
      // In a real implementation, you'd need to store the original email content
      // For now, we'll just log that we would retry
      console.log(`Would retry email to ${emailLog.to} (ID: ${emailLog.id})`);
    }

    return { success: true, message: `Processed ${failedEmails.length} pending emails` };
  } catch (error) {
    console.error('Error retrying failed emails:', error);
    throw error;
  }
}

// Create fallback in-app notification when email fails
async function createFallbackNotification({ to, subject, type, templateData }) {
  try {
    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: to }
    });

    if (!user) {
      console.log(`⚠️  Cannot create fallback notification: User ${to} not found`);
      return;
    }

    // Create notification based on type
    let title, body, link;
    
    switch (type) {
      case 'notification':
        if (templateData?.eventType === 'appraisal_submitted') {
          title = 'Action Required: Appraisal Notification Failed';
          body = `We were unable to deliver your appraisal update via email. Please log in to the HR Gateway to review your appraisal status.`;
          link = '/appraisals';
        } else if (templateData?.eventType === 'appraisal_approved_supervisor') {
          title = 'Action Required: Appraisal Ready for Review';
          body = `We were unable to deliver your appraisal notification via email. An appraisal is ready for your review. Please log in to the HR Gateway.`;
          link = '/appraisals';
        } else {
          title = 'Action Required: Important Notification Failed';
          body = `We were unable to deliver an important notification via email. Please log in to the HR Gateway to check for updates.`;
          link = '/dashboard';
        }
        break;
      default:
        title = 'Action Required: Email Delivery Failed';
        body = `We were unable to deliver an email notification. Please log in to the HR Gateway to check for updates.`;
        link = '/dashboard';
    }

    await prisma.notification.create({
      data: {
        userId: user.id,
        title,
        body,
        link,
        type: 'email_fallback',
        read: false
      }
    });

    console.log(`🔔 Created fallback notification for ${to}`);
  } catch (error) {
    console.error('Error creating fallback notification:', error);
  }
}

// Get user notifications
async function getUserNotifications(userId, limit = 20) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false }
    });

    return { notifications, unreadCount };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
}

// Mark notification as read
async function markNotificationAsRead(notificationId, userId) {
  try {
    await prisma.notification.updateMany({
      where: { 
        id: notificationId,
        userId: userId 
      },
      data: { read: true }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Mark all notifications as read for user
async function markAllNotificationsAsRead(userId) {
  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

// Resend email (admin function)
async function resendEmail(emailLogId) {
  try {
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailLogId }
    });

    if (!emailLog) {
      throw new Error('Email log not found');
    }

    // Reset attempt count and status
    await prisma.emailLog.update({
      where: { id: emailLogId },
      data: {
        status: 'pending',
        attempt: 1,
        error: null
      }
    });

    // Trigger resend
    await sendEmailWithRetry({
      to: emailLog.to,
      cc: emailLog.cc,
      subject: emailLog.subject,
      html: '<p>Resending email...</p>', // In real implementation, you'd store the original content
      type: emailLog.type,
      attempt: 1
    });

    return { success: true, message: 'Email queued for resend' };
  } catch (error) {
    console.error('Error resending email:', error);
    throw error;
  }
}

module.exports = {
  sendEmailWithRetry,
  sendNotificationEmail,
  sendTestEmail,
  getEmailLogs,
  retryFailedEmails,
  getCCRecipients,
  createFallbackNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  resendEmail
};
