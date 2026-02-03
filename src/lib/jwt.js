// generate JWT tokens and verify them

import { SignJWT, jwtVerify } from "jose";


const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(payload, expiresIn = '1h') {
    return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime(expiresIn).sign(new TextEncoder().encode(SECRET_KEY));
}

export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
        return payload;
    } catch (error) {
        return null;
    }
}