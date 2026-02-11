import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('documents');

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files uploaded' },
                { status: 400 }
            );
        }

        // TODO: Get provider email from session/JWT token
        // For now using mock email
        const providerEmail = 'john.doe@example.com';

        // Create uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'documents');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const uploadedPaths = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate unique filename
            const timestamp = Date.now();
            const filename = `${timestamp}-${file.name}`;
            const filepath = join(uploadDir, filename);

            // Save file
            await writeFile(filepath, buffer);

            // Store relative path
            uploadedPaths.push(`/uploads/documents/${filename}`);
        }

        // Update provider documents in database
        await prisma.providers.update({
            where: { email: providerEmail },
            data: {
                documents: {
                    push: uploadedPaths
                },
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Documents uploaded successfully',
            files: uploadedPaths
        }, { status: 200 });

    } catch (error) {
        console.error('Document upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload documents' },
            { status: 500 }
        );
    }
}
