const nodemailer = require('nodemailer');

class SmtpMailProvider {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'hr-noreply@costaatt.edu.tt',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async sendMail(options) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'hr-noreply@costaatt.edu.tt',
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('SMTP mail send failed:', error);
      throw new Error(`Failed to send email via SMTP: ${error}`);
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
    } catch (error) {
      throw new Error(`SMTP connection test failed: ${error}`);
    }
  }
}

module.exports = { SmtpMailProvider };
