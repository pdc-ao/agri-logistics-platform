import { db } from '@/lib/prisma';

export default async function OfferingsPage() {
  const offerings = await prisma.offering.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { schedules: true } } }
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Offerings</h1>
      <table className="w-full text-sm border">
        <thead className="bg-neutral-100">
          <tr>
            <th className="p-2 text-left">Title</th>
            <th className="p-2">Schedules</th>
            <th className="p-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {offerings.map(o => (
            <tr key={o.id} className="border-t">
              <td className="p-2">{o.title}</td>
              <td className="p-2">{o._count.schedules}</td>
              <td className="p-2">{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {offerings.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center text-neutral-500">No offerings.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}cd 