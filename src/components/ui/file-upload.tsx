// src/components/ui/file-upload.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onUploadComplete: (fileUrl: string, fileKey: string) => void;
  folder?: string;
  accept?: string;
  maxSize?: number;
  label?: string;
  multiple?: boolean;
  className?: string;
}

export function FileUpload({
  onUploadComplete,
  folder = 'uploads',
  accept = 'image/*,application/pdf',
  maxSize = 5 * 1024 * 1024, // 5MB
  label = 'Upload File',
  multiple = false,
  className = '',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file size
        if (file.size > maxSize) {
          throw new Error(`File ${file.name} exceeds ${maxSize / (1024 * 1024)}MB limit`);
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        // Upload file
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Upload failed');
        }

        const data = await response.json();
        onUploadComplete(data.fileUrl, data.fileKey);

        // Update progress
        setProgress(((i + 1) / files.length) * 100);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      
      <label htmlFor="file-upload">
        <Button
          type="button"
          variant="secondary"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading... {progress.toFixed(0)}%
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {label}
            </>
          )}
        </Button>
      </label>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Image Upload with Preview
interface ImageUploadProps extends FileUploadProps {
  currentImage?: string;
  onRemove?: () => void;
}

export function ImageUpload({
  currentImage,
  onRemove,
  ...props
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleUploadComplete = (fileUrl: string, fileKey: string) => {
    setPreview(fileUrl);
    props.onUploadComplete(fileUrl, fileKey);
  };

  const handleRemove = () => {
    setPreview(null);
    if (onRemove) onRemove();
  };

  return (
    <div className={props.className}>
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <FileUpload
          {...props}
          accept="image/*"
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}

// Multiple Image Upload with Gallery
interface MultipleImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
}

export function MultipleImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  folder = 'products',
}: MultipleImageUploadProps) {
  const handleUploadComplete = (fileUrl: string) => {
    if (images.length < maxImages) {
      onImagesChange([...images, fileUrl]);
    }
  };

  const handleRemove = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images ({images.length}/{maxImages})
        </label>
        
        {images.length < maxImages && (
          <FileUpload
            onUploadComplete={handleUploadComplete}
            folder={folder}
            accept="image/*"
            label="Add Image"
          />
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className="h-32 w-full object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}