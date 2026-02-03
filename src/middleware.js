import { NextResponse } from 'next/server'
import { verifyToken } from './lib/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request) {

    if (request.nextUrl.pathname.startsWith('/api/v1/validatelogin')) {
        return NextResponse.next();
    }

    //Check whether a custom header 'Authorization' is present
    const token = request.headers.get('Authorization');
    if (!token) {
        return NextResponse.json({ message: 'Authorization token is missing' }, { status: 401 });
    } else {
        //validate token here (implementation depends on your auth strategy)
        //if invalid, return unauthorized response
        //if valid, proceed
        const isValidToken = await verifyToken(token.replace('Bearer ', ''));
        console.log('Token validation result in middleware:', isValidToken);
        if (!isValidToken) {
            return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
        }

        return NextResponse.next();
    }
}
// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/api/v1/:path*']
}