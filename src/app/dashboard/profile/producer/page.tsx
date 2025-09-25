import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import ProfileShell from '@/components/dashboard/profile-shell';

export default async function ProducerProfilePage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect('/login');

  const user = await db.user.findUnique({ where: { id: session.user.id } });

  if (!user) {
    return <div className="p-8">User not found.</div>;
  }

  if (user.role !== 'PRODUCER') {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold">Access denied</h2>
        <p className="mt-2">This page is for producers only. Your role: {user.role}</p>
        <a href="/dashboard" className="text-blue-600 mt-4 block">Go back to Dashboard</a>
      </div>
    );
  }

  // Example counts (replace with real queries as needed)
  const productCount = await db.productListing.count({ where: { producerId: user.id } });
  const averageRating = user.averageRating ?? 0;

  return (
    <ProfileShell user={user}>
      <div>
        <h2 className="text-xl font-semibold mb-2">Producer Overview</h2>
        <p className="text-sm text-gray-600 mb-4">
          Manage your product listings, storage and orders.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Products</div>
            <div className="text-2xl font-bold">{productCount}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Average Rating</div>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Create</div>
            <div>
              <a href="/products" className="text-blue-600">Manage Products</a><br />
              <a href="/dashboard/storage/new" className="text-blue-600">Add Storage</a>
            </div>
          </div>
        </div>

        <section>
          <h3 className="font-semibold mb-2">Recent Listings</h3>
          <div className="space-y-2">
            {/* For demo, list the latest 5 products */}
            {(
              await db.productListing.findMany({
                where: { producerId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, title: true, pricePerUnit: true, createdAt: true }
              })
            ).map((p) => (
              <div key={p.id} className="p-3 border rounded">
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-gray-500">Price: {p.pricePerUnit} {p.currency ?? 'AOA'}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ProfileShell>
  );
}