import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function PaymentsPage() {
  const payments = await prisma.paymentTransaction.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      escrow: true,
      buyer: { select: { username: true } },
      seller: { select: { username: true } }
    },
    take: 50
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Payments & Escrow</h1>
      <table className="w-full text-sm border">
        <thead className="bg-neutral-100">
          <tr>
            <th className="p-2 text-left">Buyer</th>
            <th className="p-2">Seller</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">Escrow</th>
            <th className="p-2">Buyer Conf.</th>
            <th className="p-2">Seller Conf.</th>
            <th className="p-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.buyer.username}</td>
              <td className="p-2">{p.seller.username}</td>
              <td className="p-2">{p.amount.toString()} {p.currency}</td>
              <td className="p-2"><span className="px-2 py-0.5 text-xs rounded bg-neutral-200">{p.status}</span></td>
              <td className="p-2">{p.escrow ? p.escrow.status : '-'}</td>
              <td className="p-2">{p.buyerConfirmed ? 'Yes' : 'No'}</td>
              <td className="p-2">{p.sellerConfirmed ? 'Yes' : 'No'}</td>
              <td className="p-2">{new Date(p.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}