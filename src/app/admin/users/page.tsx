'use client';

import { useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: string;
  verificationStatus?: string;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin - Usuários</h1>
      {loading ? (
        <div className="text-sm text-gray-500">Carregando...</div>
      ) : (
        <div className="overflow-auto border rounded bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Usuário</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Função</th>
                <th className="px-4 py-2 text-left">Verificação</th>
                <th className="px-4 py-2 text-left">Criado</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">{u.fullName || u.username}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs px-2 py-1 rounded bg-gray-100">
                      {u.verificationStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-red-600 text-xs underline">
                      Suspender
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-xs text-gray-500" colSpan={6}>
                    Nenhum usuário
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400">
        (Ação suspender não implementada; criar endpoint PUT/PATCH /api/admin/users/:id)
      </p>
    </div>
  );
}