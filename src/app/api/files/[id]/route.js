import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteObject } from '@/lib/s3';

export async function DELETE(request, { params }) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const file = await prisma.uploaded_files.findUnique({
            where: { id },
        });

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        if (file.userId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete from S3
        try {
            await deleteObject(file.fileKey);
        } catch (s3Error) {
            console.error('S3 delete error:', s3Error);
        }

        // Delete from database
        await prisma.uploaded_files.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('File delete error:', error);
        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
}
