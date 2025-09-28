'use client';

import DocumentUpload from '@/components/verification/DocumentUpload';

export default function ProfileDocumentsPage() {
  const userId = 'replace-with-session-id';
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800">Documentos de Verificação</h1>
      <DocumentUpload userId={userId} />
    </div>
  );
}