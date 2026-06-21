import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create transporter instance
const createTransporter = () => {
    const rawPassword = process.env.EMAIL_PASSWORD || '';
    const cleanPassword = rawPassword.replace(/\s+/g, ''); // Automatically trim accidental spaces

    console.log(`[Email Debug] EMAIL_USER exists: ${!!process.env.EMAIL_USER}`);
    console.log(`[Email Debug] EMAIL_PASSWORD exists: ${!!cleanPassword}`);
    console.log(`[Email Debug] EMAIL_PASSWORD length: ${cleanPassword.length}`);

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: cleanPassword,
        },
    });
};

/**
 * Generates the HTML template for the password reset email
 */
const getPasswordResetTemplate = (resetUrl) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
            body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { background-color: #18181b; padding: 30px; text-align: center; }
            .logo { font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; text-decoration: none; }
            .logo span { color: #00FF88; }
            .content { padding: 40px 30px; color: #3f3f46; line-height: 1.6; }
            h1 { color: #18181b; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: 700; }
            .button-container { text-align: center; margin: 35px 0; }
            .button { background-color: #00FF88; color: #18181b; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0, 255, 136, 0.2); }
            .button:hover { background-color: #00e67a; transform: translateY(-1px); }
            .warning { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-top: 30px; font-size: 14px; color: #991b1b; border-radius: 0 8px 8px 0; }
            .footer { background-color: #fafafa; padding: 20px; text-align: center; font-size: 13px; color: #a1a1aa; border-top: 1px solid #f4f4f5; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <a href="#" class="logo">Bajara<span>man</span></a>
            </div>
            <div class="content">
                <h1>Reset Your Password</h1>
                <p>Hello,</p>
                <p>We received a request to reset the password associated with your Bajaraman account. No changes have been made to your account yet.</p>
                <p>You can reset your password by clicking the button below:</p>
                
                <div class="button-container">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p style="font-size: 14px; color: #71717a;">If the button doesn't work, copy and paste this link into your web browser:<br>
                <a href="${resetUrl}" style="color: #00FF88; word-break: break-all;">${resetUrl}</a></p>
                
                <div class="warning">
                    <strong>Security Notice:</strong> This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </div>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Bajaraman. All rights reserved.<br>
                Productivity Reimagined.
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Sends a password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetUrl - The unique reset URL
 * @returns {Promise<boolean>} - True if successful
 */
export const sendPasswordResetEmail = async (to, resetUrl) => {
    try {
        console.log(`[Email Service] Attempting to send password reset email to ${to}`);
        
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Bajaraman" <noreply@bajaraman.com>',
            to: to,
            subject: 'Reset Your Password - Bajaraman',
            html: getPasswordResetTemplate(resetUrl),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Email sent successfully! Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[Email Service] Failed to send email:', error);
        throw error;
    }
};

/**
 * Sends a diagnostic test email
 * @returns {Promise<Object>} - SMTP response
 */
export const sendTestEmail = async () => {
    try {
        console.log('[Email Service] Attempting to send diagnostic test email...');
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Bajaraman" <noreply@bajaraman.com>',
            to: process.env.EMAIL_USER,
            subject: 'Diagnostic Test Email - Bajaraman SMTP',
            text: 'This is a diagnostic test email to verify SMTP delivery.',
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Test email sent successfully! Message ID: ${info.messageId}`);
        return { success: true, message: 'Test email sent successfully', info };
    } catch (error) {
        console.error('[Email Service] Diagnostic test email failed:', error);
        return { success: false, message: 'Test email failed', error: error.message, stack: error.stack };
    }
};

/**
 * Tests the SMTP connection configuration
 * @returns {Promise<Object>} - Status object
 */
export const testEmailConnection = async () => {
    try {
        console.log('[Email Service] Testing SMTP connection...');
        
        const transporter = createTransporter();
        
        // verify connection configuration
        await transporter.verify();
        
        console.log('[Email Debug] SMTP verification result: SUCCESS');
        return { success: true, message: 'SMTP connection verified successfully' };
    } catch (error) {
        console.error('[Email Debug] SMTP verification result: FAILED', error);
        return { 
            success: false, 
            message: 'SMTP connection failed', 
            error: error.message,
            stack: error.stack
        };
    }
};

export default {
    sendPasswordResetEmail,
    testEmailConnection,
    sendTestEmail
};
