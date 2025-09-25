import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import ProfileShell from '@/components/dashboard/profile-shell';

export default async function ConsumerProfilePage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect('/login');

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return <div className="p-8">User not found.</div>;

  // Consumers may be role 'USER' or 'CONSUMER' depending on your schema
  const allowed = ['USER', 'CONSUMER', 'BUYER'].includes(user.role ?? '');
  if (!allowed) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold">Access</h2>
        <p className="mt-2">This page is for consumers. Your role: {user.role}</p>
        <a href="/dashboard" className="text-blue-600 mt-4 block">Go back</a>
      </div>
    );
  }

  // Example: recent orders
  const recentOrders = await db.order.findMany({
    where: { buyerId: user.id },
    orderBy: { orderDate: 'desc' },
    take: 5,
    select: { id: true, totalAmount: true, orderStatus: true, orderDate: true }
  });

  return (
    <ProfileShell user={user}>
      <div>
        <h2 className="text-xl font-semibold mb-2">My Profile</h2>
        <p className="text-sm text-gray-600 mb-4">Manage your account, orders and saved producers.</p>

        <div className="mb-6 grid sm:grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Recent Orders</div>
            <div className="text-lg font-medium">{recentOrders.length}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Saved Producers</div>
            <div className="text-lg font-medium">—</div>
          </div>
        </div>

        <section>
          <h3 className="font-semibold mb-2">Recent Orders</h3>
          <div className="space-y-2">
            {recentOrders.map(o => (
              <div key={o.id} className="p-3 border rounded">
                <div className="font-medium">Order #{o.id}</div>
                <div className="text-sm text-gray-500">{o.orderStatus} — {new Date(o.orderDate).toLocaleDateString()}</div>
                <div className="text-sm">Total: {o.totalAmount} {o.currency ?? 'AOA'}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ProfileShell>
  );
}