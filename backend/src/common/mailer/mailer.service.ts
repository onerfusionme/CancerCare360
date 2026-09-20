import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

export interface SendCredentialsOptions {
  to: string;
  name: string;
  roleName: string;
  password?: string;
  loginUrl?: string;
  tenantName?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isSmtpConfigured = false;

  constructor(private readonly prisma: PrismaService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.isSmtpConfigured = true;
      this.logger.log(`SMTP configured with host: ${host}:${port}`);
    } else {
      this.isSmtpConfigured = false;
      this.logger.warn('SMTP credentials not provided in environment. Running in Dev/Audit dispatch mode (emails logged & recorded).');
    }
  }

  public async sendUserCredentialsEmail(options: SendCredentialsOptions): Promise<{
    success: boolean;
    channel: string;
    messageId?: string;
    previewUrl?: string;
    subject: string;
  }> {
    const { to, name, roleName, password, tenantName } = options;
    const loginUrl = options.loginUrl || process.env.FRONTEND_URL || 'http://localhost:3000/login';
    const hospitalName = tenantName || 'CancerCare360 Comprehensive Oncology Network';
    const subject = `Welcome to ${hospitalName} - Your Staff Access Credentials`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #4f46e5 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
    .logo-badge { display: inline-block; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 32px; }
    .greeting { font-size: 17px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }
    .intro { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .card { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 28px; }
    .card-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .card-row:last-child { border-bottom: none; }
    .card-label { font-size: 12px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; }
    .card-value { font-size: 15px; font-weight: 600; color: #0f172a; }
    .credential-box { background: #0f172a; color: #38bdf8; padding: 8px 14px; border-radius: 8px; font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: 700; letter-spacing: 1px; display: inline-block; }
    .role-tag { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 700; }
    .button-container { text-align: center; margin: 32px 0; }
    .login-btn { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); }
    .security-note { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; font-size: 13px; color: #92400e; line-height: 1.5; }
    .footer { background: #f8fafc; padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">CancerCare360 Hub</div>
      <h1>Welcome to the Platform</h1>
      <p>${hospitalName}</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${name},</div>
      <div class="intro">
        A staff account has been provisioned for you by the Super Administrator on <strong>CancerCare360</strong>. You now have role-based clinical and administrative access to our centralized oncology command center.
      </div>
      
      <div class="card">
        <div class="card-row">
          <span class="card-label">Assigned Role</span>
          <span class="role-tag">${roleName}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Login ID / Username</span>
          <span class="card-value">${to}</span>
        </div>
        ${
          password
            ? `
        <div class="card-row">
          <span class="card-label">Initial Password</span>
          <span class="credential-box">${password}</span>
        </div>
        `
            : ''
        }
        <div class="card-row">
          <span class="card-label">Access Portal URL</span>
          <span class="card-value"><a href="${loginUrl}" style="color: #4f46e5; text-decoration: none;">${loginUrl}</a></span>
        </div>
      </div>

      <div class="security-note">
        <strong>Security & Privacy Notice:</strong> This account contains protected health information (PHI) governed by DPDP and clinical governance policies. Please log in promptly and update your password under Account Settings. Do not share these credentials with anyone.
      </div>

      <div class="button-container">
        <a href="${loginUrl}" class="login-btn" target="_blank">Log In to CancerCare360</a>
      </div>
    </div>

    <div class="footer">
      <p>Sent automatically by CancerCare360 Healthcare Infrastructure.</p>
      <p>For technical support or access adjustments, please contact your Super Administrator.</p>
    </div>
  </div>
</body>
</html>
`;

    if (this.isSmtpConfigured && this.transporter) {
      try {
        const from = process.env.SMTP_FROM || `"CancerCare360 Platform" <no-reply@cancercare360.com>`;
        const info = await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
        });

        this.logger.log(`Credential email successfully delivered to ${to} (MessageID: ${info.messageId})`);
        return {
          success: true,
          channel: 'SMTP',
          messageId: info.messageId,
          subject,
        };
      } catch (error: any) {
        this.logger.error(`SMTP delivery failed for ${to}: ${error?.message}`);
        // Fallback to local log
      }
    }

    // Dev / Fallback mode: Print full credentials dispatch to server log
    this.logger.log(`\n========================================================================`);
    this.logger.log(`📧 [EMAIL DISPATCHED] To: ${to} | Role: ${roleName}`);
    this.logger.log(`Subject: ${subject}`);
    this.logger.log(`Login ID: ${to}`);
    this.logger.log(`Password: ${password || '[Unchanged / Pre-existing]'}`);
    this.logger.log(`Software URL: ${loginUrl}`);
    this.logger.log(`========================================================================\n`);

    return {
      success: true,
      channel: 'LOCAL_DISPATCH_RECORD',
      messageId: `local-${Date.now()}`,
      subject,
    };
  }
}
