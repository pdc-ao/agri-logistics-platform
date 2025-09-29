import type { ReactNode } from 'react';
import type { VerificationStatus, UserRole } from '@/types';

interface ProfileShellProps {
  user: {
    fullName?: string;
    username?: string;
    email?: string;
    verificationStatus?: VerificationStatus;
    role?: UserRole;
  };
  children: ReactNode;
}

export default function ProfileShell({ user, children }: ProfileShellProps) {
  const status = user.verificationStatus || 'PENDING';
  const statusClass =
    status === 'VERIFIED'
      ? 'bg-green-100 text-green-700'
      : status === 'REJECTED'
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700';

  return (
    <div className="p-8">
      <header className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
          {user?.fullName?.[0] ?? user?.username?.[0] ?? 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {user?.fullName ?? user?.username ?? 'User'}
          </h1>
          <p className="text-sm text-gray-600">{user?.email}</p>
          <div className="mt-2 flex gap-2 items-center">
            {user.role && (
              <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">
                {user.role.replace('_',' ')}
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded ${statusClass}`}>
              {status}
            </span>
          </div>
        </div>
      </header>

      <main className="grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2 bg-white p-6 rounded shadow-sm">
          {children}
        </section>
        <aside className="bg-white p-6 rounded shadow-sm">
          <h2 className="font-semibold mb-2">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="/dashboard" className="text-green-600">Dashboard</a></li>
            <li><a href="/products" className="text-green-600">Produtos</a></li>
            <li><a href="/storage" className="text-green-600">Armazenamento</a></li>
            <li><a href="/transport" className="text-green-600">Transporte</a></li>
            <li><a href="/profile/documents" className="text-green-600">Documentos</a></li>
            <li><a href="/api/auth/signout" className="text-red-600">Sair</a></li>
          </ul>
        </aside>
      </main>
    </div>
  );
}