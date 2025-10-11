import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import ProfileShell from '@/components/dashboard/profile-shell';

export default async function AdminProfilePage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect('/login');

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return <div className="p-8">User not found.</div>;

  if (user.role !== 'ADMIN') {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold">Access denied</h2>
        <p className="mt-2">This page is for admins only. Your role: {user.role}</p>
        <a href="/dashboard" className="text-blue-600 mt-4 block">Go back</a>
      </div>
    );
  }

  // Example admin stats
  const totalUsers = await db.user.count();
  const totalProducts = await db.productListing.count();
  const pendingOrders = await db.order.count({ where: { orderStatus: 'Pending' } });

  // Transform user object to match ProfileShell expectations
  const profileUser = {
    fullName: user.fullName ?? undefined,
    username: user.username,
    email: user.email,
    verificationStatus: user.verificationStatus,
    role: user.role,
  };

  return (
    <ProfileShell user={profileUser}>
      <div>
        <h2 className="text-xl font-semibold mb-2">Admin Overview</h2>
        <p className="text-sm text-gray-600 mb-4">Platform metrics and management links.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Users</div>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Products</div>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Pending Orders</div>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </div>
        </div>

        <section>
          <h3 className="font-semibold mb-2">Admin Actions</h3>
          <ul className="space-y-2">
            <li><a href="/dashboard/users" className="text-blue-600">Manage Users</a></li>
            <li><a href="/dashboard/orders" className="text-blue-600">Manage Orders</a></li>
            <li><a href="/api/reviews" className="text-blue-600">Moderate Reviews (API)</a></li>
          </ul>
        </section>
      </div>
    </ProfileShell>
  );
}
