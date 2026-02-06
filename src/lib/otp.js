import crypto from 'crypto';

export function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

export function isOTPExpired(createdAt, expiryMinutes = 15) {
    const now = new Date();
    const otpCreatedAt = new Date(createdAt);
    const diffMinutes = (now - otpCreatedAt) / (1000 * 60);
    return diffMinutes > expiryMinutes;
}