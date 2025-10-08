import { db } from '@/lib/prisma';

export default async function ComponentsPage() {
  const components = await prisma.component.findMany({
    orderBy: { createdAt: 'desc' },
    include: { supplier: true }
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Components</h1>
      <table className="w-full text-sm border">
        <thead className="bg-neutral-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2">Category</th>
            <th className="p-2">Supplier</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Unit Price</th>
            <th className="p-2">Requested By</th>
            <th className="p-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {components.map(c => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.category}</td>
              <td className="p-2">{c.supplier.name}</td>
              <td className="p-2">{c.stockLevel}</td>
              <td className="p-2">{c.unitPrice}</td>
              <td className="p-2">{c.requestedBy ? c.requestedBy.slice(0, 8) : '-'}</td>
              <td className="p-2">{new Date(c.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {components.length === 0 && (
            <tr>
              <td colSpan={7} className="p-4 text-center text-neutral-500 text-sm">
                No components.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}