import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    endpoint: process.env.AWS_S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    },
    forcePathStyle: false,
});

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function POST(request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const fileName = file.name;
        const fileType = file.type;
        const fileSize = file.size;

        // Generate unique key
        const ext = fileName.split('.').pop();
        const uniqueId = generateUniqueId();
        const fileKey = `uploads/${userId}/${uniqueId}.${ext}`;

        // Read file buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey,
            Body: buffer,
            ContentType: fileType,
            ACL: 'public-read',
        });

        await s3Client.send(command);

        const publicUrl = `${process.env.AWS_S3_BUCKET_URL}/${fileKey}`;

        // Save file metadata to database
        const savedFile = await prisma.uploaded_files.create({
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
            file: {
                id: savedFile.id,
                fileName: savedFile.fileName,
                fileUrl: savedFile.fileUrl,
                fileType: savedFile.fileType,
                fileSize: savedFile.fileSize,
                createdAt: savedFile.createdAt,
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file: ' + error.message }, { status: 500 });
    }
}
