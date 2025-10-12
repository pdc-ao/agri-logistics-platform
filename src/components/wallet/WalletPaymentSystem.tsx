// src/components/wallet/WalletPaymentSystem.tsx
import { db } from '@/lib/prisma';

export default async function WalletPaymentSystem({
  userid,
  userRole,
}: {
  userid: string;
  userRole: string;
}) {
  const wallet = await db.walletBalance.findUnique({
    where: { userId: userid },
  });

  const transactions = await db.paymentTransaction.findMany({
    where: { OR: [{ buyerId: userid }, { sellerId: userid }] },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div className="p-4 space-y-4">
      <h2 className="font-semibold">Wallet & Payments</h2>
      <p className="text-neutral-600">
        Balance: {wallet?.balance.toString() ?? '0'} AOA
      </p>
      <h3 className="text-sm font-medium">Recent Transactions</h3>
      <ul className="space-y-1 text-sm">
        {transactions.map((t) => (
          <li key={t.id} className="border-b pb-1">
            {t.type} • {t.amount.toString()} {t.currency} • {t.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
