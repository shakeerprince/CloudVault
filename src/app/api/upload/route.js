import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generatePresignedUploadUrl, getPublicUrl } from '@/lib/s3';
import { v4 as uuidv4 } from 'crypto';

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function POST(request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fileName, fileType, fileSize } = await request.json();

        if (!fileName || !fileType) {
            return NextResponse.json({ error: 'fileName and fileType are required' }, { status: 400 });
        }

        // Generate unique key
        const ext = fileName.split('.').pop();
        const uniqueId = generateUniqueId();
        const fileKey = `uploads/${userId}/${uniqueId}.${ext}`;

        // Generate presigned URL
        const presignedUrl = await generatePresignedUploadUrl(fileKey, fileType);
        const publicUrl = getPublicUrl(fileKey);

        // Save file metadata to database
        const file = await prisma.uploaded_files.create({
            data: {
                userId,
                fileName,
                fileKey,
                fileUrl: publicUrl,
                fileSize: fileSize || 0,
                fileType,
            },
        });

        return NextResponse.json({
            success: true,
            presignedUrl,
            file: {
                id: file.id,
                fileName: file.fileName,
                fileUrl: file.fileUrl,
                fileType: file.fileType,
                fileSize: file.fileSize,
                createdAt: file.createdAt,
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }
}
