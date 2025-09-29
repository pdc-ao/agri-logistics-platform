'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { UserRole } from '@/types';

interface UserLike {
  id: string;
  fullName?: string;
  username?: string;
  role: UserRole;
  verificationStatus?: string;
  averageRating?: number;
}

interface DashboardLayoutProps {
  user: UserLike;
  children: React.ReactNode;
}

const navigationItems: Record<UserRole, { name: string; href: string; icon: string; }[]> = {
  ADMIN: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Verificações', href: '/admin/verification', icon: '✅' },
    { name: 'Relatórios', href: '/admin/analytics', icon: '📈' },
  ],
  PRODUCER: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Meus Produtos', href: '/dashboard/products', icon: '🌾' },
    { name: 'Pedidos', href: '/dashboard/orders', icon: '📦' },
    { name: 'Carteira', href: '/dashboard/wallet', icon: '💰' },
    { name: 'Mensagens', href: '/messages', icon: '💬' },
  ],
  CONSUMER: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Produtos', href: '/products', icon: '🛒' },
    { name: 'Pedidos', href: '/dashboard/orders', icon: '📦' },
    { name: 'Carteira', href: '/dashboard/wallet', icon: '💰' },
    { name: 'Mensagens', href: '/messages', icon: '💬' },
  ],
  STORAGE_OWNER: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Armazéns', href: '/dashboard/storage', icon: '🏢' },
    { name: 'Reservas', href: '/dashboard/storage/bookings', icon: '📅' },
    { name: 'Carteira', href: '/dashboard/wallet', icon: '💰' },
  ],
  TRANSPORTER: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Serviços', href: '/dashboard/transport', icon: '🚚' },
    { name: 'Rotas', href: '/dashboard/transport/routes', icon: '🗺️' },
    { name: 'Carteira', href: '/dashboard/wallet', icon: '💰' },
  ],
  TRANSFORMER: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Instalações', href: '/dashboard/facilities', icon: '🏭' },
    { name: 'Processos', href: '/dashboard/facilities/jobs', icon: '⚙️' },
    { name: 'Carteira', href: '/dashboard/wallet', icon: '💰' },
  ],
};

export default function RoleBasedDashboard({ user, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = navigationItems[user.role] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-col bg-white pt-5 pb-4">
            <div className="flex items-center justify-between px-4">
              <h1 className="text-xl font-bold text-gray-900">Agri Platform</h1>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-500">✕</button>
            </div>
            <nav className="mt-5 flex-1 overflow-y-auto">
              <ul className="px-2 space-y-1">
                {navItems.map(item => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
          <div className="flex h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Agri Platform</h1>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.fullName || user.username}
                </p>
                <p className="text-xs text-gray-500">{user.role.replace('_',' ')}</p>
                <span
                  className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded ${
                    user.verificationStatus === 'VERIFIED'
                      ? 'bg-green-100 text-green-700'
                      : user.verificationStatus === 'REJECTED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {user.verificationStatus || 'PENDING'}
                </span>
              </div>
            </div>
          </div>

            <nav className="flex-1">
              <ul className="space-y-1">
                {navItems.map(item => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-x-3 rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"
                    >
                      <span>{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
        </div>
      </div>

      {/* Main */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-30 flex h-16 items-center bg-white border-b px-4 shadow-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            ☰
          </button>
          <h1 className="ml-4 text-lg font-semibold text-gray-800">Dashboard</h1>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}