import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/login', '/signup', '/api/auth/login', '/api/auth/register'];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth-token')?.value;

    // If no token and trying to access protected route, redirect to login
    if (!token) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'x9k2m8p4q7w3n6v1t5y0r8e2u4i6o3a');
        const { payload } = await jwtVerify(token, secret);

        // Add user info to headers for API routes
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.userId);
        requestHeaders.set('x-user-role', payload.role);
        requestHeaders.set('x-user-name', payload.name);

        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    } catch (error) {
        // Invalid token
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth-token');
        return response;
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};