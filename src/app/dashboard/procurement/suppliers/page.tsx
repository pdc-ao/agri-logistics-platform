import { db } from '@/lib/prisma';
export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { components: true } } }
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Suppliers</h1>
        <form action="/api/procurement/suppliers" method="post" className="flex gap-2">
          <input
            name="name"
            placeholder="Name"
            className="border rounded px-2 py-1 text-sm"
            required
          />
          <input
            name="contact"
            placeholder="Contact"
            className="border rounded px-2 py-1 text-sm"
            required
          />
          <input
            name="location"
            placeholder="Location"
            className="border rounded px-2 py-1 text-sm"
            required
          />
          <button
            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
          >Add</button>
        </form>
      </div>
      <table className="w-full text-sm border">
        <thead className="bg-neutral-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2">Contact</th>
            <th className="p-2">Location</th>
            <th className="p-2">Components</th>
            <th className="p-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(s => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.contact}</td>
              <td className="p-2">{s.location}</td>
              <td className="p-2">{s._count.components}</td>
              <td className="p-2">{new Date(s.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {suppliers.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-neutral-500 text-sm">
                No suppliers.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}