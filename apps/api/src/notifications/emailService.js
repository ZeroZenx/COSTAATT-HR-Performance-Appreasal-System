const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'noreply@costaatt.edu.tt',
        pass: process.env.SMTP_PASS || 'password'
      }
    });
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'COSTAATT HR <noreply@costaatt.edu.tt>',
        to,
        subject,
        html,
        text
      });
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send failed:', error);
      return { success: false, error: error.message };
    }
  }

  async appraisalSubmitted({ appraisalId, employeeName, managerName, hrEmails }) {
    const subject = `Performance Appraisal Submitted - ${employeeName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Performance Appraisal Submitted</h2>
        <p>Dear HR Team,</p>
        <p><strong>${employeeName}</strong> has submitted their performance appraisal for review.</p>
        <p><strong>Manager:</strong> ${managerName}</p>
        <p><strong>Appraisal ID:</strong> ${appraisalId}</p>
        <p>Please review the submission in the HR Performance Management System.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from COSTAATT HR Performance Management System.
        </p>
      </div>
    `;

    const text = `Performance Appraisal Submitted - ${employeeName}\n\nDear HR Team,\n\n${employeeName} has submitted their performance appraisal for review.\nManager: ${managerName}\nAppraisal ID: ${appraisalId}\n\nPlease review the submission in the HR Performance Management System.`;

    // Send to HR team
    const hrResults = await Promise.all(
      hrEmails.map(email => this.sendEmail({ to: email, subject, html, text }))
    );

    // Send to employee
    const employeeEmail = `${employeeName.toLowerCase().replace(' ', '.')}@costaatt.edu.tt`;
    const employeeSubject = `Your Performance Appraisal Has Been Submitted`;
    const employeeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appraisal Submitted Successfully</h2>
        <p>Dear ${employeeName},</p>
        <p>Your performance appraisal has been successfully submitted and is now under review by your manager.</p>
        <p>You will be notified once the review process is complete.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from COSTAATT HR Performance Management System.
        </p>
      </div>
    `;

    const employeeResult = await this.sendEmail({ 
      to: employeeEmail, 
      subject: employeeSubject, 
      html: employeeHtml, 
      text: `Your performance appraisal has been successfully submitted and is now under review.` 
    });

    return { hrResults, employeeResult };
  }

  async reminder({ employeeName, managerName, appraisalId, daysOverdue }) {
    const subject = `Performance Appraisal Reminder - ${employeeName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Performance Appraisal Reminder</h2>
        <p>Dear ${managerName},</p>
        <p>The performance appraisal for <strong>${employeeName}</strong> has been pending for ${daysOverdue} days.</p>
        <p><strong>Appraisal ID:</strong> ${appraisalId}</p>
        <p>Please complete your review as soon as possible to keep the process moving.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated reminder from COSTAATT HR Performance Management System.
        </p>
      </div>
    `;

    const text = `Performance Appraisal Reminder - ${employeeName}\n\nDear ${managerName},\n\nThe performance appraisal for ${employeeName} has been pending for ${daysOverdue} days.\nAppraisal ID: ${appraisalId}\n\nPlease complete your review as soon as possible.`;

    return await this.sendEmail({ to: `${managerName.toLowerCase().replace(' ', '.')}@costaatt.edu.tt`, subject, html, text });
  }
}

module.exports = new EmailService();
