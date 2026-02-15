import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

        // Get all users with file counts
        const users = await prisma.users.findMany({
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Get file counts and storage per user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const files = await prisma.uploaded_files.findMany({
                    where: { userId: user.id },
                    select: { fileSize: true },
                });
                const totalSize = files.reduce((sum, f) => sum + (f.fileSize || 0), 0);
                return {
                    ...user,
                    fileCount: files.length,
                    totalStorage: totalSize,
                };
            })
        );

        // Get overall stats
        const totalFiles = await prisma.uploaded_files.count();
        const allFiles = await prisma.uploaded_files.findMany({
            select: { fileSize: true },
        });
        const totalStorage = allFiles.reduce((sum, f) => sum + (f.fileSize || 0), 0);

        return NextResponse.json({
            users: usersWithStats,
            stats: {
                totalUsers: users.length,
                totalFiles,
                totalStorage,
            },
        });
    } catch (error) {
        console.error('Admin users error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
