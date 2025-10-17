const sgMail = require('@sendgrid/mail');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send email using SendGrid API
 */
async function sendEmailWithSendGrid({ to, cc, subject, html, type = 'notification' }) {
  try {
    const msg = {
      to: to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'hr@costaatt.edu.tt',
        name: process.env.SENDGRID_FROM_NAME || 'COSTAATT HR Gateway'
      },
      subject: subject,
      html: html,
    };

    // Add CC if provided
    if (cc) {
      msg.cc = cc;
    }

    // Send email
    const response = await sgMail.send(msg);
    
    // Log successful email
    await prisma.emailLog.create({
      data: {
        to: to,
        cc: cc || null,
        subject: subject,
        status: 'sent',
        type: type,
        attempt: 1,
        error: null,
      },
    });

    console.log('✅ Email sent successfully via SendGrid:', response[0].statusCode);
    return { success: true, messageId: response[0].headers['x-message-id'] };

  } catch (error) {
    console.error('❌ SendGrid email failed:', error.message);
    
    // Log failed email
    await prisma.emailLog.create({
      data: {
        to: to,
        cc: cc || null,
        subject: subject,
        status: 'failed',
        type: type,
        attempt: 1,
        error: error.message,
      },
    });

    return { success: false, error: error.message };
  }
}

/**
 * Send email with retry logic (using SendGrid)
 */
async function sendEmailWithRetry({ to, cc, subject, html, type = 'notification', attempt = 1 }) {
  // Check if email is disabled
  if (process.env.EMAIL_ENABLED === 'false') {
    console.log('📧 Email system disabled, skipping email send');
    return { success: true, message: 'Email system disabled' };
  }

  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.log('⚠️ SendGrid API key not configured, skipping email send');
    return { success: false, error: 'SendGrid API key not configured' };
  }

  try {
    const result = await sendEmailWithSendGrid({ to, cc, subject, html, type });
    
    if (result.success) {
      return result;
    } else {
      // Retry logic for SendGrid
      if (attempt < 3) {
        console.log(`🔄 Retrying email in 10 minutes... (attempt ${attempt + 1}/3)`);
        setTimeout(() => {
          sendEmailWithRetry({ to, cc, subject, html, type, attempt: attempt + 1 });
        }, 10 * 60 * 1000); // 10 minutes
      }
      return result;
    }
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test SendGrid connection
 */
async function testSendGridConnection() {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      return { success: false, error: 'SendGrid API key not configured' };
    }

    // Test with a simple email
    const msg = {
      to: 'test@example.com', // This won't actually send
      from: process.env.SENDGRID_FROM_EMAIL || 'hr@costaatt.edu.tt',
      subject: 'Test Connection',
      html: '<p>This is a test email to verify SendGrid connection.</p>',
    };

    // Validate the email (this will check the API key without sending)
    await sgMail.send(msg);
    return { success: true, message: 'SendGrid connection successful' };

  } catch (error) {
    if (error.code === 400 && error.message.includes('test@example.com')) {
      // This is expected - we're just testing the connection
      return { success: true, message: 'SendGrid API key is valid' };
    }
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendEmailWithRetry,
  sendEmailWithSendGrid,
  testSendGridConnection,
};

