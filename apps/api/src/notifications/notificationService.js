const { GraphMailProvider } = require('./providers/graphMailProvider.js');
const { SmtpMailProvider } = require('./providers/smtpMailProvider.js');

class NotificationService {
  constructor() {
    const provider = process.env.MAIL_PROVIDER || 'smtp';
    
    if (provider === 'graph') {
      this.provider = new GraphMailProvider();
    } else {
      this.provider = new SmtpMailProvider();
    }
  }

  async sendAppraisalSubmittedEmployee(employee, appraisal, cycle) {
    const subject = `Appraisal Submitted - ${cycle.name}`;
    const html = this.generateEmployeeEmailHTML(employee, appraisal, cycle);
    
    await this.provider.sendMail({
      to: employee.email,
      subject,
      html,
    });
  }

  async sendAppraisalSubmittedHR(employee, appraisal, cycle) {
    const subject = `New Appraisal Submission - ${employee.fullName}`;
    const html = this.generateHREmailHTML(employee, appraisal, cycle);
    
    const hrList = (process.env.HR_NOTIFY_LIST || 'hr@costaatt.edu.tt')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    
    for (const hrEmail of hrList) {
      await this.provider.sendMail({
        to: hrEmail,
        subject,
        html,
      });
    }
  }

  generateEmployeeEmailHTML(employee, appraisal, cycle) {
    const appUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Appraisal Submitted</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8fafc; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>COSTAATT HR Performance Gateway</h1>
            <h2>Appraisal Submitted Successfully</h2>
          </div>
          <div class="content">
            <p>Dear ${employee.firstName},</p>
            <p>Your performance appraisal for <strong>${cycle.name}</strong> has been successfully submitted.</p>
            
            <h3>Submission Details:</h3>
            <ul>
              <li><strong>Employee:</strong> ${employee.fullName}</li>
              <li><strong>Department:</strong> ${employee.department}</li>
              <li><strong>Position:</strong> ${employee.jobTitle}</li>
              <li><strong>Cycle:</strong> ${cycle.name}</li>
              <li><strong>Submitted:</strong> ${new Date(appraisal.updatedAt).toLocaleString()}</li>
            </ul>
            
            <p>Your appraisal is now under review by your supervisor and HR team.</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/appraisals" class="button">View Appraisal Status</a>
            </p>
            
            <p>If you have any questions, please contact HR.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from COSTAATT HR Performance Gateway.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateHREmailHTML(employee, appraisal, cycle) {
    const appUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Appraisal Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8fafc; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 4px; }
          .alert { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>COSTAATT HR Performance Gateway</h1>
            <h2>New Appraisal Submission</h2>
          </div>
          <div class="content">
            <div class="alert">
              <strong>Action Required:</strong> A new performance appraisal has been submitted and requires review.
            </div>
            
            <h3>Employee Information:</h3>
            <ul>
              <li><strong>Name:</strong> ${employee.fullName}</li>
              <li><strong>Email:</strong> ${employee.email}</li>
              <li><strong>Department:</strong> ${employee.department}</li>
              <li><strong>Position:</strong> ${employee.jobTitle}</li>
            </ul>
            
            <h3>Appraisal Details:</h3>
            <ul>
              <li><strong>Cycle:</strong> ${cycle.name}</li>
              <li><strong>Appraisal ID:</strong> ${appraisal.id}</li>
              <li><strong>Submitted:</strong> ${new Date(appraisal.updatedAt).toLocaleString()}</li>
              <li><strong>Status:</strong> ${appraisal.status}</li>
            </ul>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/appraisals/${appraisal.id}" class="button">Review Appraisal</a>
            </p>
            
            <p>Please review this appraisal in the HR system and take appropriate action.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from COSTAATT HR Performance Gateway.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection() {
    try {
      await this.provider.testConnection();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}

module.exports = { NotificationService };
