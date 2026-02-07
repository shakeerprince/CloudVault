import { NextResponse } from 'next/server';
import { resetPasswordService } from '@/app/services/providers_service';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, otp, newPassword } = body;

        // Validate required fields
        if (!email || !otp || !newPassword) {
            return NextResponse.json(
                { message: 'Email, OTP, and new password are required' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return NextResponse.json(
                { message: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        const result = await resetPasswordService(email, otp, newPassword);

        if (!result.success) {
            return NextResponse.json(
                { message: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message,
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to reset password' },
            { status: 500 }
        );
    }
}