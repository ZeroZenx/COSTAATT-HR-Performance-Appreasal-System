const getAccessToken = require('../auth/graphToken');

class GraphEmailService {
  constructor() {
    this.senderEmail = 'hr@costaatt.edu.tt';
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Send email using Microsoft Graph API
   * @param {Object} emailData - Email configuration
   * @param {string} emailData.to - Recipient email address
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.body - Email body (HTML)
   * @param {string} [emailData.cc] - CC recipient email address
   * @param {string} [emailData.bcc] - BCC recipient email address
   * @returns {Promise<Object>} - Result object with success status and details
   */
  async sendEmail(emailData) {
    const { to, subject, body, cc, bcc } = emailData;
    
    try {
      // Get access token
      const accessToken = await getAccessToken();
      
      // Prepare recipients
      const toRecipients = [{ emailAddress: { address: to } }];
      
      // Handle multiple CC recipients (comma-separated)
      const ccRecipients = cc ? cc.split(',').map(email => ({ 
        emailAddress: { address: email.trim() } 
      })) : undefined;
      
      // Handle multiple BCC recipients (comma-separated)
      const bccRecipients = bcc ? bcc.split(',').map(email => ({ 
        emailAddress: { address: email.trim() } 
      })) : undefined;

      // Prepare email payload
      const emailPayload = {
        message: {
          subject: subject,
          body: {
            contentType: 'HTML',
            content: body
          },
          toRecipients: toRecipients,
          ...(ccRecipients && { ccRecipients }),
          ...(bccRecipients && { bccRecipients })
        },
        saveToSentItems: true
      };

      // Send email with retry logic
      const result = await this.sendWithRetry(accessToken, emailPayload, {
        to,
        subject,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('❌ Email send failed:', error);
      return {
        success: false,
        error: error.message,
        recipient: to,
        subject,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Send email with retry logic
   */
  async sendWithRetry(accessToken, emailPayload, metadata) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`📧 Sending email (attempt ${attempt}/${this.retryAttempts}):`, {
          to: metadata.to,
          subject: metadata.subject
        });

        const response = await fetch(`https://graph.microsoft.com/v1.0/users/${this.senderEmail}/sendMail`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailPayload)
        });

        if (response.ok) {
          console.log('✅ Email sent successfully:', {
            to: metadata.to,
            subject: metadata.subject,
            timestamp: metadata.timestamp
          });

          return {
            success: true,
            recipient: metadata.to,
            subject: metadata.subject,
            timestamp: metadata.timestamp,
            attempt
          };
        } else {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (error) {
        lastError = error;
        console.error(`❌ Email send attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.retryAttempts) {
          console.log(`⏳ Retrying in ${this.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          this.retryDelay *= 2; // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  /**
   * Send appraisal confirmation email to appraisee
   */
  async sendAppraisalConfirmation(appraiseeEmail, appraiseeName, managerEmail = null) {
    const subject = 'Appraisal Submission Confirmation - COSTAATT HR';
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5aa0;">Appraisal Submission Confirmed</h2>
        <p>Dear ${appraiseeName},</p>
        <p>Your performance appraisal has been successfully submitted to the HR Performance Gateway system.</p>
        <p><strong>Submission Details:</strong></p>
        <ul>
          <li>Date: ${new Date().toLocaleDateString()}</li>
          <li>Time: ${new Date().toLocaleTimeString()}</li>
          <li>Status: Submitted for Review</li>
        </ul>
        <p>Your appraisal will now be reviewed by your supervisor and the HR department. You will be notified of any updates or next steps.</p>
        <p>If you have any questions, please contact the HR department.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          This is an automated message from the COSTAATT HR Performance Gateway.<br>
          Please do not reply to this email.
        </p>
      </div>
    `;

    const emailData = {
      to: appraiseeEmail,
      subject,
      body,
      cc: managerEmail ? `${managerEmail},hr@costaatt.edu.tt,dheadley@costaatt.edu.tt` : 'hr@costaatt.edu.tt,dheadley@costaatt.edu.tt'
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Send notification to manager about appraisal submission
   */
  async sendManagerNotification(managerEmail, managerName, appraiseeName, appraiseeEmail) {
    const subject = `Appraisal Review Required - ${appraiseeName}`;
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5aa0;">Appraisal Review Required</h2>
        <p>Dear ${managerName},</p>
        <p>A performance appraisal has been submitted for your review.</p>
        <p><strong>Appraisal Details:</strong></p>
        <ul>
          <li>Employee: ${appraiseeName}</li>
          <li>Email: ${appraiseeEmail}</li>
          <li>Submission Date: ${new Date().toLocaleDateString()}</li>
          <li>Submission Time: ${new Date().toLocaleTimeString()}</li>
        </ul>
        <p>Please log into the HR Performance Gateway to review and provide your feedback on this appraisal.</p>
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Review the submitted appraisal</li>
          <li>Provide your assessment and feedback</li>
          <li>Submit your review to HR for final processing</li>
        </ol>
        <p>If you have any questions, please contact the HR department.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          This is an automated message from the COSTAATT HR Performance Gateway.<br>
          Please do not reply to this email.
        </p>
      </div>
    `;

    const emailData = {
      to: managerEmail,
      subject,
      body,
      cc: 'hr@costaatt.edu.tt,dheadley@costaatt.edu.tt'
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Send HR notification about appraisal submission
   */
  async sendHRNotification(appraiseeName, appraiseeEmail, managerName, managerEmail) {
    const subject = `New Appraisal Submission - ${appraiseeName}`;
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5aa0;">New Appraisal Submission</h2>
        <p>A new performance appraisal has been submitted and requires HR attention.</p>
        <p><strong>Submission Details:</strong></p>
        <ul>
          <li>Employee: ${appraiseeName}</li>
          <li>Employee Email: ${appraiseeEmail}</li>
          <li>Manager: ${managerName}</li>
          <li>Manager Email: ${managerEmail}</li>
          <li>Submission Date: ${new Date().toLocaleDateString()}</li>
          <li>Submission Time: ${new Date().toLocaleTimeString()}</li>
        </ul>
        <p>Please monitor the review process and ensure timely completion of the appraisal cycle.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          This is an automated message from the COSTAATT HR Performance Gateway.<br>
          Please do not reply to this email.
        </p>
      </div>
    `;

    const emailData = {
      to: 'hr@costaatt.edu.tt',
      subject,
      body,
      cc: 'dheadley@costaatt.edu.tt'
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Send appraisal submission workflow emails
   */
  async sendAppraisalWorkflowEmails(appraisalData) {
    const results = [];
    
    try {
      // Send confirmation to appraisee
      const confirmationResult = await this.sendAppraisalConfirmation(
        appraisalData.appraiseeEmail,
        appraisalData.appraiseeName,
        appraisalData.managerEmail
      );
      results.push(confirmationResult);

      // Send notification to manager
      if (appraisalData.managerEmail) {
        const managerResult = await this.sendManagerNotification(
          appraisalData.managerEmail,
          appraisalData.managerName,
          appraisalData.appraiseeName,
          appraisalData.appraiseeEmail
        );
        results.push(managerResult);
      }

      // Send HR notification
      const hrResult = await this.sendHRNotification(
        appraisalData.appraiseeName,
        appraisalData.appraiseeEmail,
        appraisalData.managerName,
        appraisalData.managerEmail
      );
      results.push(hrResult);

      console.log('✅ Appraisal workflow emails sent:', {
        totalEmails: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      });

      return {
        success: true,
        results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      };
    } catch (error) {
      console.error('❌ Appraisal workflow email failed:', error);
      return {
        success: false,
        error: error.message,
        results
      };
    }
  }
}

module.exports = GraphEmailService;
