// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToS3, validateFile } from '@/lib/s3-upload';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3
    const result = await uploadToS3(
      buffer,
      file.name,
      file.type,
      `${folder}/${session.user.id}`
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      fileUrl: result.fileUrl,
      fileKey: result.fileKey,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for generating presigned URLs (client-side uploads)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get('fileName');
    const mimeType = searchParams.get('mimeType');
    const folder = searchParams.get('folder') || 'uploads';

    if (!fileName || !mimeType) {
      return NextResponse.json(
        { error: 'fileName and mimeType are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validation = validateFile(
      { size: 0, type: mimeType },
      Infinity // Skip size check for presigned URLs
    );
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { generatePresignedUrl } = await import('@/lib/s3-upload');
    const result = await generatePresignedUrl(
      fileName,
      mimeType,
      `${folder}/${session.user.id}`
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to generate presigned URL' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Presigned URL error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}