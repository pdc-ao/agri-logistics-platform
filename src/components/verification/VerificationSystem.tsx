'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRequiredDocuments, getDocumentDisplayName } from '@/types/documents';

interface BusinessDocument {
  id: string;
  docType: string;
  fileUrl: string;
  status: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewerId?: string;
  notes?: string;
}

interface User {
  id: string;
  username: string;
  fullName?: string;
  entityType: 'INDIVIDUAL' | 'COMPANY';
  role: string;
  verificationStatus: string;
  verificationDetails?: string;
  businessDocuments?: BusinessDocument[];
}

interface VerificationSystemProps {
  user: User;
  isAdmin?: boolean;
}

export default function VerificationSystem({ user, isAdmin = false }: VerificationSystemProps) {
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const requiredDocs = getRequiredDocuments(user.entityType, user.role);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/verification/documents?userId=${user.id}`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedDocType) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('docType', selectedDocType);
      formData.append('userId', user.id);

      const response = await fetch('/api/verification/documents', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newDocument = await response.json();
        setDocuments(prev => [newDocument, ...prev]);
        setSelectedFile(null);
        setSelectedDocType('');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao enviar documento');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentReview = async (documentId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/verification/documents/${documentId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error reviewing document:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-64">Loading…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Status Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Status de Verificação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Status atual: {user.verificationStatus}</p>
        </CardContent>
      </Card>

      {/* Upload Section (non-admin) */}
      {!isAdmin && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enviar Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="border rounded p-2 mb-2"
            >
              <option value="">Selecione o tipo</option>
              {requiredDocs.map((docType) => (
                <option key={docType} value={docType}>
                  {getDocumentDisplayName(docType)}
                </option>
              ))}
            </select>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="mb-2"
            />
            <Button onClick={handleFileUpload} disabled={!selectedFile || !selectedDocType || uploading}>
              {uploading ? 'Enviando...' : 'Enviar Documento'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos {isAdmin ? 'para Revisão' : 'Enviados'}</CardTitle>
        </CardHeader>
        <CardContent>
          {requiredDocs.map((docType) => {
            const doc = documents.find(d => d.docType === docType);
            return (
              <div key={docType} className="border rounded p-3 mb-2 flex justify-between">
                <div>
                  <p className="font-medium">{getDocumentDisplayName(docType)}</p>
                  {doc ? (
                    <span className={`px-2 py-1 rounded ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">Não enviado</span>
                  )}
                </div>
                {isAdmin && doc?.status === 'PENDING_REVIEW' && (
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => handleDocumentReview(doc.id, 'APPROVED')}>Aprovar</Button>
                    <Button size="sm" variant="outline" onClick={() => handleDocumentReview(doc.id, 'REJECTED', 'Motivo')}>Rejeitar</Button>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
