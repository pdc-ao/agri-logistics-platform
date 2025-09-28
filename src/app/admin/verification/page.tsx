'use client';

import { useEffect, useState } from 'react';

interface Doc {
  id: string;
  userId: string;
  docType: string;
  status: string;
  fileUrl: string;
  submittedAt: string;
  notes?: string;
  user?: { fullName?: string; username: string };
}

export default function AdminVerificationPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verification'); // Not implemented
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id: string, action: 'APPROVED' | 'REJECTED') {
    const notes = action === 'REJECTED' ? prompt('Motivo da rejeição:') : undefined;
    // Placeholder
    alert(`API para ${action} doc ${id} (notes=${notes || ''})`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin - Verificações</h1>
      {loading ? (
        <div className="text-sm text-gray-500">Carregando...</div>
      ) : (
        <div className="overflow-auto border rounded bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Usuário</th>
                <th className="px-4 py-2 text-left">Documento</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Enviado</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-2">{d.user?.fullName || d.user?.username || d.userId}</td>
                  <td className="px-4 py-2">{d.docType}</td>
                  <td className="px-4 py-2">{d.status}</td>
                  <td className="px-4 py-2">{new Date(d.submittedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <a
                      href={d.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs underline"
                    >
                      Ver
                    </a>
                    <button
                      onClick={() => act(d.id,'APPROVED')}
                      className="text-green-600 text-xs underline"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => act(d.id,'REJECTED')}
                      className="text-red-600 text-xs underline"
                    >
                      Rejeitar
                    </button>
                  </td>
                </tr>
              ))}
              {docs.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-xs text-gray-500" colSpan={5}>
                    Nenhuma pendência
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400">
        (Endpoints admin/verification não implementados.)
      </p>
    </div>
  );
}