'use client';

import WalletDashboard from '@/components/wallet/WalletDashboard';

export default function WalletPage() {
  // Replace with session hook
  const userId = 'replace-with-session-user-id';
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Carteira</h1>
      <WalletDashboard userId={userId} />
    </div>
  );
}