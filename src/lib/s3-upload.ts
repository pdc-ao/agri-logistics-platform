// src/lib/s3-upload.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileKey?: string;
  error?: string;
}

/**
 * Upload file to S3
 */
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  mimeType: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `${folder}/${timestamp}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: file,
      ContentType: mimeType,
      ACL: 'public-read', // Make file publicly accessible
    });

    await s3Client.send(command);

    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return {
      success: true,
      fileUrl,
      fileKey,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(fileKey: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    return false;
  }
}

/**
 * Generate presigned URL for secure uploads from client
 */
export async function generatePresignedUrl(
  fileName: string,
  mimeType: string,
  folder: string = 'uploads'
): Promise<{ uploadUrl: string; fileKey: string; fileUrl: string } | null> {
  try {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `${folder}/${timestamp}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: mimeType,
      ACL: 'public-read',
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return { uploadUrl, fileKey, fileUrl };
  } catch (error) {
    console.error('Presigned URL generation error:', error);
    return null;
  }
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File | { size: number; type: string },
  maxSize: number = 5 * 1024 * 1024, // 5MB default
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Get file extension from mime type
 */
export function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  };
  return extensions[mimeType] || 'bin';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}