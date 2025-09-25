import type { ReactNode } from 'react';

export default function ProfileShell({ user, children }: { user: any; children: ReactNode }) {
  return (
    <div className="p-8">
      <header className="mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
          {user?.fullName?.[0] ?? 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user?.fullName ?? user?.username ?? 'User'}</h1>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
      </header>

      <main className="grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2 bg-white p-6 rounded shadow-sm">
          {children}
        </section>

        <aside className="bg-white p-6 rounded shadow-sm">
          <h2 className="font-semibold mb-2">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="/dashboard" className="text-blue-600">Dashboard Home</a></li>
            <li><a href="/products" className="text-blue-600">Products</a></li>
            <li><a href="/transport" className="text-blue-600">Transport</a></li>
            <li><a href="/storage" className="text-blue-600">Storage</a></li>
            <li><a href="/api/auth/signout" className="text-red-600">Sign out</a></li>
          </ul>
        </aside>
      </main>
    </div>
  );
}