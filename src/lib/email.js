import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail({ email, name, otp }) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'YMechanics <info@imantechsolutions.com>',
            to: [email],
            subject: 'Verify Your Mechanic Registration - YMechanics',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9fafb; padding: 30px; }
                        .otp-box { background-color: white; border: 2px dashed #4F46E5; padding: 20px; text-align: center; margin: 20px 0; }
                        .otp { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; }
                        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to YMechanics!</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${name},</h2>
                            <p>Thank you for registering as a mechanic with YMechanics. To complete your registration, please verify your email address.</p>
                            
                            <div class="otp-box">
                                <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code</p>
                                <div class="otp">${otp}</div>
                            </div>
                            
                            <p><strong>Important:</strong></p>
                            <ul>
                                <li>This OTP is valid for 15 minutes</li>
                                <li>Do not share this code with anyone</li>
                                <li>If you didn't request this, please ignore this email</li>
                            </ul>
                            
                            <p>Best regards,<br>The YMechanics Team</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 YMechanics. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('Email sending error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email sending exception:', error);
        return { success: false, error: error.message };
    }
}