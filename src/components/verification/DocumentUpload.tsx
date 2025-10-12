'use client';

import { useState, useEffect } from 'react';
import { BusinessDocument } from '@/types';
import { getRequiredDocuments, getDocumentDisplayName } from '@/types/documents';

interface DocumentUploadProps {
  userId: string;
  entityType: 'INDIVIDUAL' | 'COMPANY';
  role: string;
  onDocumentUploaded?: (document: BusinessDocument) => void;
}

export default function DocumentUpload({ userId, entityType, role, onDocumentUploaded }: DocumentUploadProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [requiredDocs, setRequiredDocs] = useState<string[]>([]);

  useEffect(() => {
    // Dynamically determine required docs
    const docs = getRequiredDocuments(entityType, role);
    setRequiredDocs(docs);

    // Fetch already uploaded docs for this user
    fetch(`/api/users/${userId}/documents`)
      .then(res => res.json())
      .then(data => setDocuments(data.documents || []))
      .catch(err => console.error('Failed to fetch documents', err));
  }, [userId, entityType, role]);

  const handleFileUpload = async (file: File, docType: string) => {
    setUploading(docType);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);
      formData.append('userId', userId);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const document = await response.json();
        setDocuments(prev => {
          // replace if already exists
          const others = prev.filter(d => d.docType !== docType);
          return [...others, document];
        });
        onDocumentUploaded?.(document);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Document Verification</h3>
        <p className="mt-1 text-sm text-gray-600">
          Upload the required documents to verify your account and unlock all features.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requiredDocs.map((docType) => {
          const existingDoc = documents.find(doc => doc.docType === docType);
          const isUploading = uploading === docType;

          return (
            <div key={docType} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {getDocumentDisplayName(docType)}
                      <span className="text-red-500 ml-1">*</span>
                    </h4>
                    {existingDoc && (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(existingDoc.status)}`}>
                          {existingDoc.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {existingDoc.submittedAt
                            ? `Uploaded ${new Date(existingDoc.submittedAt).toLocaleDateString()}`
                            : "Upload date unknown"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {existingDoc && existingDoc.status === "VERIFIED" && (
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}

                  <input
                    type="file"
                    id={`file-${docType}`}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, docType);
                      }
                    }}
                  />
                  
                  <label
                    htmlFor={`file-${docType}`}
                    className={`cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                        Uploading...
                      </>
                    ) : existingDoc ? (
                      'Replace'
                    ) : (
                      'Upload'
                    )}
                  </label>
                </div>
              </div>

              {existingDoc?.rejectionReason && existingDoc.status === 'REJECTED' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">
                    <strong>Rejection reason:</strong> {existingDoc.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
