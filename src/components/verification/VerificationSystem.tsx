// src/components/verification/VerificationSystem.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const documentTypes = [
    { value: 'ID', label: 'Documento de Identidade', icon: '🆔' },
    { value: 'BusinessRegistration', label: 'Registro Comercial', icon: '📋' },
    { value: 'TaxCertificate', label: 'Certificado Fiscal', icon: '📜' },
    { value: 'FarmLicense', label: 'Licença Agrícola', icon: '🚜' },
    { value: 'TransportLicense', label: 'Licença de Transporte', icon: '🚛' },
    { value: 'StorageLicense', label: 'Licença de Armazenamento', icon: '🏭' },
    { value: 'QualityCertificate', label: 'Certificado de Qualidade', icon: '✅' },
    { value: 'InsuranceCertificate', label: 'Certificado de Seguro', icon: '🛡️' }
  ];

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
        alert('Documento enviado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao enviar documento');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentReview = async (documentId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/verification/documents/${documentId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      if (response.ok) {
        fetchDocuments();
        alert('Documento revisado com sucesso!');
      } else {
        alert('Erro ao revisar documento');
      }
    } catch (error) {
      console.error('Error reviewing document:', error);
      alert('Erro ao revisar documento');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return '✅';
      case 'PENDING': return '⏳';
      case 'REJECTED': return '❌';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Status de Verificação</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user.verificationStatus === 'VERIFIED' 
                ? 'bg-green-100 text-green-800'
                : user.verificationStatus === 'PENDING'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {user.verificationStatus === 'VERIFIED' && '✅ Verificado'}
              {user.verificationStatus === 'PENDING' && '⏳ Pendente'}
              {user.verificationStatus === 'REJECTED' && '❌ Rejeitado'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">
                {documents.filter(d => d.status === 'APPROVED').length}
              </div>
              <div className="text-sm text-gray-600">Aprovados</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {documents.filter(d => d.status === 'PENDING').length}
              </div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {documents.filter(d => d.status === 'REJECTED').length}
              </div>
              <div className="text-sm text-gray-600">Rejeitados</div>
            </div>
          </div>
          
          {user.verificationDetails && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">{user.verificationDetails}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!isAdmin && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enviar Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Documento
                  </label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Selecione o tipo</option>
                    {documentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arquivo
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile || !selectedDocType || uploading}
                className="w-full md:w-auto"
              >
                {uploading ? 'Enviando...' : 'Enviar Documento'}
              </Button>

              <div className="text-xs text-gray-500">
                Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Documentos {isAdmin ? 'para Revisão' : 'Enviados'}</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-600">
                {isAdmin ? 'Nenhum documento para revisão' : 'Nenhum documento enviado ainda'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {documentTypes.find(t => t.value === doc.docType)?.icon || '📄'}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {documentTypes.find(t => t.value === doc.docType)?.label || doc.docType}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Enviado em {new Date(doc.submittedAt).toLocaleDateString('pt-AO')}
                          </p>
                        </div>
                      </div>

                      {doc.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          <strong>Observações:</strong> {doc.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)} {doc.status}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.fileUrl, '_blank')}
                      >
                        Ver Arquivo
                      </Button>

                      {isAdmin && doc.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleDocumentReview(doc.id, 'APPROVED')}
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              const notes = prompt('Motivo da rejeição:');
                              if (notes) {
                                handleDocumentReview(doc.id, 'REJECTED', notes);
                              }
                            }}
                          >
                            Rejeitar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}