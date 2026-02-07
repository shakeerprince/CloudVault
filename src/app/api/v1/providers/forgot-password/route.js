import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';
import { getUserByUsernameService } from '@/app/services/users_service';
import { updateProviderOTPService } from '@/app/services/providers_service';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Validate email exists
        const user = await getUserByUsernameService(email);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Generate OTP
        const otp = generateOTP();

        // Encrypt OTP
        const encryptedOTP = encrypt(otp);

        // Create reset link with encrypted OTP
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/mechanics/reset-password?token=${encodeURIComponent(encryptedOTP)}`;

        // Store OTP in database (for validation during reset)
        await updateProviderOTPService(email, encryptedOTP);

        // Send email
        await sendPasswordResetEmail({
            email,
            name: user.name,
            resetLink
        });

        return NextResponse.json(
            { message: 'Password reset email sent successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}