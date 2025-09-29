'use client';

import DocumentUpload from '@/components/verification/DocumentUpload';

export default function DocumentsPage() {
  // In a real scenario get user id from session
  const userId = 'replace-with-session-user-id';

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Verificação de Documentos</h1>
      <DocumentUpload userId={userId} />
    </div>
  );
}