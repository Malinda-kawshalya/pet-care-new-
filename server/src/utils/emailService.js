import crypto from "crypto";
import nodemailer from "nodemailer";

// Email configuration - using environment variables
const emailConfig = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password"
  }
};

// Create transporter
let transporter;
try {
  transporter = nodemailer.createTransport(emailConfig);
} catch (error) {
  console.warn("Email service not configured. Email notifications will be logged to console.");
  transporter = null;
}

// Email templates
const emailTemplates = {
  welcomeEmail: (name, verificationToken, verificationLink) => ({
    subject: "Welcome to Pet Care - Verify Your Email",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #118c7e 0%, #0d7367 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; }
            .content { background: #f8faf9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #118c7e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: bold; }
            .token { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e7e4ee; margin: 15px 0; font-family: monospace; word-break: break-all; }
            .footer { color: #686776; font-size: 12px; margin-top: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🐾 Pet Care</h1>
              <p>Welcome to the Platform</p>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for registering with Pet Care! We're excited to have you on board.</p>
              <p>To complete your registration and verify your email address, please click the button below or use the verification token provided:</p>
              <center>
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </center>
              <p>Or copy and paste this verification token:</p>
              <div class="token">${verificationToken}</div>
              <p>This verification link will expire in 24 hours.</p>
              <p>If you didn't create this account, please ignore this email.</p>
              <div class="footer">
                <p>&copy; 2024 Pet Care. All rights reserved.</p>
                <p>This is an automated email. Please do not reply directly.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  passwordResetEmail: (name, resetToken, resetLink) => ({
    subject: "Reset Your Pet Care Password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d74372 0%, #c43d35 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; }
            .content { background: #f8faf9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #d74372; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: bold; }
            .token { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e7e4ee; margin: 15px 0; font-family: monospace; word-break: break-all; }
            .warning { background: #fff2d8; border-left: 4px solid #c77a12; padding: 12px; margin: 15px 0; border-radius: 4px; }
            .footer { color: #686776; font-size: 12px; margin-top: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We received a request to reset your Pet Care password.</p>
              <p>Click the button below to reset your password:</p>
              <center>
                <a href="${resetLink}" class="button">Reset Password</a>
              </center>
              <p>Or use this reset token:</p>
              <div class="token">${resetToken}</div>
              <div class="warning">
                <strong>⚠️ Important:</strong> This password reset link will expire in 1 hour. If you didn't request this, please ignore this email.
              </div>
              <p>If you're having trouble clicking the button, copy and paste the link below into your web browser:</p>
              <p style="word-break: break-all; background: white; padding: 10px; border-radius: 4px;">${resetLink}</p>
              <div class="footer">
                <p>&copy; 2024 Pet Care. All rights reserved.</p>
                <p>This is an automated email. Please do not reply directly.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  approvalNotification: (name, role, status) => ({
    subject: `Your Pet Care ${role} Account Has Been ${status}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${status === 'approved' ? 'linear-gradient(135deg, #2f8b45 0%, #1f6932 100%)' : 'linear-gradient(135deg, #c43d35 0%, #9d2d27 100%)'}; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; }
            .content { background: #f8faf9; padding: 30px; border-radius: 0 0 8px 8px; }
            .success { background: #e5f6e8; border-left: 4px solid #2f8b45; padding: 12px; margin: 15px 0; border-radius: 4px; color: #176b3a; }
            .button { display: inline-block; background: #118c7e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: bold; }
            .footer { color: #686776; font-size: 12px; margin-top: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${status === 'approved' ? '✓ Approved' : '✗ Not Approved'}</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              ${status === 'approved'
                ? `<div class="success">
                    <p><strong>Great news!</strong> Your account has been approved. You can now access all features on Pet Care.</p>
                  </div>
                  <center><a href="${process.env.CLIENT_URL}/dashboard" class="button">Go to Dashboard</a></center>`
                : `<p>Thank you for applying. Unfortunately, your account has not been approved at this time. Please contact support if you have questions.</p>`
              }
              <div class="footer">
                <p>&copy; 2024 Pet Care. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  })
};

// Send email function
export async function sendEmail(to, templateType, templateData) {
  if (!transporter) {
    console.log(`[EMAIL LOG] ${templateType} to ${to}:`, templateData);
    return { success: true, message: "Email logged to console (not configured)" };
  }

  try {
    let template;
    switch (templateType) {
      case "welcome":
        template = emailTemplates.welcomeEmail(...templateData);
        break;
      case "passwordReset":
        template = emailTemplates.passwordResetEmail(...templateData);
        break;
      case "approval":
        template = emailTemplates.approvalNotification(...templateData);
        break;
      default:
        throw new Error(`Unknown template type: ${templateType}`);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || emailConfig.auth.user,
      to,
      ...template
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}:`, result.response);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`Failed to send ${templateType} email to ${to}:`, error);
    // Return success anyway in development mode to not break the flow
    return { success: process.env.NODE_ENV === "development", error: error.message };
  }
}

// Generate verification link
export function generateVerificationLink(token) {
  const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return `${baseUrl}/auth?mode=verify&token=${token}`;
}

// Generate password reset link
export function generatePasswordResetLink(token) {
  const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return `${baseUrl}/auth?mode=reset&token=${token}`;
}

// Verify email configuration
export function verifyEmailConfig() {
  if (!transporter) {
    console.warn("⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD environment variables.");
    return false;
  }
  return true;
}

// Test email configuration
export async function testEmailConfig() {
  if (!transporter) {
    return { success: false, message: "Email service not configured" };
  }

  try {
    await transporter.verify();
    return { success: true, message: "Email configuration verified successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export default { sendEmail, generateVerificationLink, generatePasswordResetLink, verifyEmailConfig, testEmailConfig };
