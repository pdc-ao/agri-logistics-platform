'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserRole, User } from '@/types';

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
}

const navigationItems = {
  [UserRole.ADMIN]: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'User Management', href: '/admin/users', icon: '👥' },
    { name: 'Verification Queue', href: '/admin/verification', icon: '✅' },
    { name: 'Content Moderation', href: '/admin/moderation', icon: '🛡️' },
    { name: 'Reports & Analytics', href: '/admin/analytics', icon: '📈' },
    { name: 'System Settings', href: '/admin/settings', icon: '⚙️' },
  ],
  [UserRole.PRODUCER]: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'My Products', href: '/products/manage', icon: '🌾' },
    { name: 'Orders', href: '/orders', icon: '📦' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
    { name: 'Messages', href: '/messages', icon: '💬' },
    { name: 'Wallet', href: '/wallet', icon: '💰' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ],
  [UserRole.CONSUMER]: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Browse Products', href: '/products', icon: '🛒' },
    { name: 'My Orders', href: '/orders', icon: '📦' },
    { name: 'Messages', href: '/messages', icon: '💬' },
    { name: 'Wallet', href: '/wallet', icon: '💰' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ],
  [UserRole.STORAGE_OWNER]: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'My Facilities', href: '/storage/manage', icon: '🏢' },
    { name: 'Bookings', href: '/storage/bookings', icon: '📅' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
    { name: 'Messages', href: '/messages', icon: '💬' },
    { name: 'Wallet', href: '/wallet', icon: '💰' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ],
  [UserRole.TRANSPORTER]: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'My Services', href: '/transport/manage', icon: '🚛' },
    { name: 'Active Jobs', href: '/transport/jobs', icon: '🚚' },
    { name: 'Routes', href: '/transport/routes', icon: '🗺️' },
    { name: 'Messages', href: '/messages', icon: '💬' },
    { name: 'Wallet', href: '/wallet', icon: '💰' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ],
  [UserRole.TRANSFORMER]: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'My Facilities', href: '/transformation/manage', icon: '🏭' },
    { name: 'Processing Jobs', href: '/transformation/jobs', icon: '⚙️' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
    { name: 'Messages', href: '/messages', icon: '💬' },
    { name: 'Wallet', href: '/wallet', icon: '💰' },
    { name: 'Profile', href: '/profile', icon: '👤' },
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
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">Agri Platform</h1>
            </div>
            <nav className="mt-5 flex-shrink-0 h-full divide-y divide-gray-200 overflow-y-auto">
              <div className="px-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-gray-900">Agri Platform</h1>
          </div>
          
          {/* User info */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                {user.fullName?.charAt(0) || user.username.charAt(0)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.fullName || user.username}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {user.role.replace('_', ' ')}
              </p>
              <div className="flex items-center space-x-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.verificationStatus === 'VERIFIED' 
                    ? 'bg-green-100 text-green-800'
                    : user.verificationStatus === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.verificationStatus}
                </span>
                {user.averageRating && (
                  <span className="text-xs text-gray-500">
                    ⭐ {user.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-green-600 hover:bg-gray-50"
                      >
                        <span className="text-lg">{item.icon}</span>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              <label htmlFor="search-field" className="sr-only">
                Search
              </label>
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search..."
                type="search"
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}