import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getAuthSession();

  // If not signed in, redirect to login
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const role = session.user.role ?? 'USER';

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <p className="mb-4">Welcome, {session.user.name ?? session.user.email} — role: {role}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">General</h2>
          <ul className="mt-2 space-y-1">
            <li><a href="/products" className="text-blue-600">Browse Products</a></li>
            <li><a href="/transport" className="text-blue-600">Find Transport Services</a></li>
            <li><a href="/storage" className="text-blue-600">Find Storage Facilities</a></li>
          </ul>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Actions</h2>
          <ul className="mt-2 space-y-1">
            <li><a href="/dashboard/storage/new" className="text-blue-600">Create New Storage</a></li>
            <li><a href="/products" className="text-blue-600">Create / Manage Product Listings</a></li>
          </ul>
        </div>

        {role === 'PRODUCER' && (
          <div className="p-4 border rounded">
            <h2 className="font-semibold">Producer Tools</h2>
            <ul className="mt-2 space-y-1">
              <li><a href="/products" className="text-blue-600">My Product Listings</a></li>
              <li><a href="/dashboard/storage/new" className="text-blue-600">Add Storage</a></li>
            </ul>
          </div>
        )}

        {role === 'TRANSPORTER' && (
          <div className="p-4 border rounded">
            <h2 className="font-semibold">Transporter Tools</h2>
            <ul className="mt-2 space-y-1">
              <li><a href="/transport" className="text-blue-600">My Transport Services</a></li>
            </ul>
          </div>
        )}

        {role === 'ADMIN' && (
          <div className="p-4 border rounded">
            <h2 className="font-semibold">Admin</h2>
            <ul className="mt-2 space-y-1">
              <li><a href="/dashboard/users" className="text-blue-600">Manage Users</a></li>
              <li><a href="/dashboard/orders" className="text-blue-600">Manage Orders</a></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}