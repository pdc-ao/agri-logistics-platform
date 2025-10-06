// src/lib/storage.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const CDN_URL = process.env.CDN_URL || `https://${BUCKET_NAME}.s3.amazonaws.com`;

interface UploadOptions {
  folder?: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
  makePublic?: boolean;
}

/**
 * Upload file to S3
 */
export async function uploadToS3(
  file: File | Buffer,
  fileName: string,
  options: UploadOptions = {}
): Promise<{ url: string; key: string; size: number }> {
  const {
    folder = "uploads",
    allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
    maxSizeMB = 10,
    makePublic = false,
  } = options;

  // Validate file type
  const fileType = file instanceof File ? file.type : "application/octet-stream";
  if (!allowedTypes.includes(fileType)) {
    throw new Error(`File type ${fileType} not allowed. Allowed: ${allowedTypes.join(", ")}`);
  }

  // Validate file size
  const fileSize = file instanceof File ? file.size : file.length;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (fileSize > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }

  // Generate unique key
  const fileExtension = fileName.split(".").pop();
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  const key = `${folder}/${timestamp}-${uniqueId}.${fileExtension}`;

  // Get file buffer
  const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: fileType,
    ...(makePublic && { ACL: "public-read" }),
    Metadata: {
      originalName: fileName,
      uploadedAt: new Date().toISOString(),
    },
  });

  await s3Client.send(command);

  const url = `${CDN_URL}/${key}`;

  return { url, key, size: fileSize };
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Generate presigned URL for private files
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Upload multiple files
 */
export async function uploadMultipleToS3(
  files: File[],
  options: UploadOptions = {}
): Promise<Array<{ url: string; key: string; size: number; fileName: string }>> {
  const uploads = files.map(async (file) => {
    const result = await uploadToS3(file, file.name, options);
    return { ...result, fileName: file.name };
  });

  return Promise.all(uploads);
}

// src/app/api/documents/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/session-validation";
import { uploadToS3 } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

export const POST = withAuth(async (request: NextRequest, context, user) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as string;
    const relatedEntityId = formData.get("relatedEntityId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Determine folder based on document type
    const folderMap: Record<string, string> = {
      VERIFICATION: "verification-documents",
      PROFILE: "profile-documents",
      PRODUCT: "product-images",
      INVOICE: "invoices",
      CONTRACT: "contracts",
    };

    const folder = folderMap[documentType] || "documents";

    // Upload to S3
    const { url, key, size } = await uploadToS3(file, file.name, {
      folder,
      allowedTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      maxSizeMB: 10,
      makePublic: false, // Keep documents private
    });

    // Save document record to database
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        type: documentType,
        fileName: file.name,
        fileUrl: url,
        fileKey: key, // Store S3 key for deletion
        fileSize: size,
        mimeType: file.type,
        relatedEntityId,
        status: "PENDING_REVIEW",
      },
    });

    return NextResponse.json({
      success: true,
      document,
      message: "File uploaded successfully",
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error.message || "File upload failed" },
      { status: 500 }
    );
  }
});

// Delete document
export const DELETE = withAuth(async (request: NextRequest, context, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID required" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Authorization check
    if (document.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Not authorized to delete this document" },
        { status: 403 }
      );
    }

    // Delete from S3
    if (document.fileKey) {
      await deleteFromS3(document.fileKey);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error: any) {
    console.error("Document deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete document" },
      { status: 500 }
    );
  }
});