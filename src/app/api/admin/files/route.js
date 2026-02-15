import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteObject } from '@/lib/s3';

export async function GET(request) {
    try {
        const userId = request.headers.get('x-user-id');
        const userRole = request.headers.get('x-user-role');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') || '';
        const userFilter = searchParams.get('userId') || '';

        const where = {};
        if (search) {
            where.fileName = { contains: search, mode: 'insensitive' };
        }
        if (type) {
            where.fileType = { startsWith: type };
        }
        if (userFilter) {
            where.userId = userFilter;
        }

        const total = await prisma.uploaded_files.count({ where });
        const files = await prisma.uploaded_files.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                user: {
                    select: { name: true, username: true },
                },
            },
        });

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
        console.error('Admin files error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const userId = request.headers.get('x-user-id');
        const userRole = request.headers.get('x-user-role');

        if (!userId || userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { fileId } = await request.json();

        const file = await prisma.uploaded_files.findUnique({ where: { id: fileId } });
        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        await deleteObject(file.fileKey);
        await prisma.uploaded_files.delete({ where: { id: fileId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin delete error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
