// src/components/TransformationFacilities.tsx
import { db } from '@/lib/prisma';

export default async function TransformationFacilities({
  userid,
  userRole,
  isOwner,
}: {
  userid: string;
  userRole: string;
  isOwner: boolean;
}) {
  const facilities = await db.transformationFacility.findMany({
    where: isOwner ? { ownerId: userid } : {},
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-4 space-y-4">
      <h2 className="font-semibold">Transformation Facilities</h2>
      {facilities.length === 0 ? (
        <p className="text-neutral-500">No facilities found.</p>
      ) : (
        <ul className="space-y-2">
          {facilities.map((f) => (
            <li key={f.id} className="border p-2 rounded">
              <h3 className="font-medium">{f.name}</h3>
              <p className="text-sm text-neutral-600">{f.location}</p>
              <p className="text-xs text-neutral-500">
                Capacity: {f.capacity} • Service: {f.serviceType}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
