import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import ProfileShell from '@/components/dashboard/profile-shell';

export default async function StorageOwnerProfilePage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect('/auth/login');

  const user = await db.user.findUnique({ where: { id: session.user.id } });

  if (!user) return <div className="p-8">User not found.</div>;

  if (user.role !== 'STORAGE_OWNER') {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold">Access denied</h2>
        <p className="mt-2">This page is for storage owners only. Your role: {user.role}</p>
        <a href="/dashboard" className="text-blue-600 mt-4 block">Go back</a>
      </div>
    );
  }

  const storageCount = await db.storageListing.count({ where: { ownerId: user.id } });

  return (
    <ProfileShell user={user}>
      <div>
        <h2 className="text-xl font-semibold mb-2">Storage Owner Overview</h2>
        <p className="text-sm text-gray-600 mb-4">Manage your facilities, availability and pricing.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Facilities</div>
            <div className="text-2xl font-bold">{storageCount}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Bookings</div>
            <div className="text-2xl font-bold">—</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Actions</div>
            <div><a href="/storage" className="text-blue-600">View Listings</a></div>
          </div>
        </div>

        <section>
          <h3 className="font-semibold mb-2">Your Facilities</h3>
          <div className="space-y-2">
            {(await db.storageListing.findMany({
              where: { ownerId: user.id },
              take: 5,
              orderBy: { createdAt: 'desc' },
              select: { id: true, facilityName: true, city: true, availabilityStatus: true },
            })).map(s => (
              <div key={s.id} className="p-3 border rounded">
                <div className="font-medium">{s.facilityName}</div>
                <div className="text-sm text-gray-500">{s.city} — {s.availabilityStatus}</div>
                <a href={`/storage/${s.id}`} className="text-blue-600 text-sm">View</a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ProfileShell>
  );
}