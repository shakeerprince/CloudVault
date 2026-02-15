import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') || '';

        const where = { userId };

        if (search) {
            where.fileName = { contains: search, mode: 'insensitive' };
        }

        if (type) {
            where.fileType = { startsWith: type };
        }

        const [files, total] = await Promise.all([
            prisma.uploaded_files.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.uploaded_files.count({ where }),
        ]);

        return NextResponse.json({
            files,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Files list error:', error);
        return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }
}
