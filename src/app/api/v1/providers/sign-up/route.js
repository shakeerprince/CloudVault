import { NextResponse } from 'next/server';
import { addProviderService } from '@/app/services/providers_service';

export async function POST(request) {
    try {
        const body = await request.json();

        // Validate required fields
        const requiredFields = [
            'name',
            'email',
            'password',
            'phone',
            'address',
            'state_id',
            'city_id',
            'service_distance',
            'latitude',
            'longitude'
        ];

        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { message: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                { message: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate phone format (basic validation)
        const phoneRegex = /^\+?[\d\s-()]+$/;
        if (!phoneRegex.test(body.phone)) {
            return NextResponse.json(
                { message: 'Invalid phone format' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (body.password.length < 6) {
            return NextResponse.json(
                { message: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Validate coordinates
        if (body.latitude < -90 || body.latitude > 90) {
            return NextResponse.json(
                { message: 'Invalid latitude value' },
                { status: 400 }
            );
        }

        if (body.longitude < -180 || body.longitude > 180) {
            return NextResponse.json(
                { message: 'Invalid longitude value' },
                { status: 400 }
            );
        }

        // Validate service distance
        if (body.service_distance <= 0) {
            return NextResponse.json(
                { message: 'Service distance must be greater than 0' },
                { status: 400 }
            );
        }

        // Create provider
        const provider = await addProviderService({
            name: body.name,
            email: body.email,
            password: body.password,
            phone: body.phone,
            address: body.address,
            state_id: body.state_id,
            city_id: body.city_id,
            service_distance: parseFloat(body.service_distance),
            latitude: parseFloat(body.latitude),
            longitude: parseFloat(body.longitude),
        });

        if (provider.statusCode === "201") {
            return NextResponse.json({
                success: true,
                message: 'Registration successful! Please check your email for OTP verification.',
                data: {
                    id: provider.id,
                    email: provider.email,
                    name: provider.name,
                    emailSent: provider.emailSent,
                },
            }, { status: 201 });
        } else {
            return NextResponse.json(
                { message: provider.message },
                { status: parseInt(provider.statusCode) }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { message: error.message || 'Failed to register provider' },
            { status: 500 }
        );
    }
}