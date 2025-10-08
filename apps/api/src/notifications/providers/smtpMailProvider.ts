import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export class SmtpMailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'hr-noreply@costaatt.edu.tt',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async sendMail(options: MailOptions): Promise<void> {
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

  async testConnection(): Promise<void> {
    try {
      await this.transporter.verify();
    } catch (error) {
      throw new Error(`SMTP connection test failed: ${error}`);
    }
  }
}
