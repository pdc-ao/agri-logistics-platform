'use client';

import { useState } from 'react';
import { BusinessDocument } from '@/types';

interface DocumentUploadProps {
  userId: string;
  onDocumentUploaded?: (document: BusinessDocument) => void;
}

const documentTypes = [
  { value: 'ID', label: 'National ID / Passport', required: true },
  { value: 'BusinessRegistration', label: 'Business Registration', required: false },
  { value: 'TaxCertificate', label: 'Tax Certificate', required: false },
  { value: 'ProofOfAddress', label: 'Proof of Address', required: true },
  { value: 'BankStatement', label: 'Bank Statement', required: false },
];

export default function DocumentUpload({ userId, onDocumentUploaded }: DocumentUploadProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);

  const handleFileUpload = async (file: File, docType: string) => {
    setUploading(docType);
    
    try {
      // Create FormData for file upload
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
        setDocuments(prev => [...prev, document]);
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
        {documentTypes.map((docType) => {
          const existingDoc = documents.find(doc => doc.docType === docType.value);
          const isUploading = uploading === docType.value;

          return (
            <div key={docType.value} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {docType.label}
                      {docType.required && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    {existingDoc && (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(existingDoc.status)}`}>
                          {existingDoc.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          Uploaded {new Date(existingDoc.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {existingDoc && existingDoc.status === 'APPROVED' && (
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}

                  <input
                    type="file"
                    id={`file-${docType.value}`}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, docType.value);
                      }
                    }}
                  />
                  
                  <label
                    htmlFor={`file-${docType.value}`}
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

              {existingDoc?.notes && existingDoc.status === 'REJECTED' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">
                    <strong>Rejection reason:</strong> {existingDoc.notes}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Upload Guidelines</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Files must be in PDF, JPG, or PNG format</li>
                <li>Maximum file size: 5MB</li>
                <li>Documents must be clear and legible</li>
                <li>Personal information must be clearly visible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}