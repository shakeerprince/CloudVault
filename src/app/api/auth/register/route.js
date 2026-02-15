import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(request) {
    try {
        const { name, username, password, role } = await request.json();

        if (!name || !username || !password) {
            return NextResponse.json({ error: 'Name, username, and password are required' }, { status: 400 });
        }

        const existingUser = await prisma.users.findUnique({ where: { username } });

        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.users.create({
            data: {
                name,
                username,
                password: hashedPassword,
                role: role || 'CUSTOMER',
            },
        });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({
            userId: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(secret);

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
            },
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
