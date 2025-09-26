import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const docType = formData.get('docType') as string;
    const userId = formData.get('userId') as string;

    if (!file || !docType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Here you would upload the file to your storage service (AWS S3, etc.)
    // For now, we'll simulate with a placeholder URL
    const fileUrl = `https://storage.example.com/documents/${userId}/${docType}-${Date.now()}.${file.name.split('.').pop()}`;

    // Save document record to database
    const document = await db.businessDocument.create({
      data: {
        userId,
        docType,
        fileUrl,
        status: 'PENDING',
      },
    });

    return NextResponse.json(document, { status: 201 });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}