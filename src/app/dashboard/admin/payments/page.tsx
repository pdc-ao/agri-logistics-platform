// src/app/dashboard/admin/payments/page.tsx
import { getAuthSession, requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminPaymentsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const transactions = await db.paymentTransaction.findMany({
    include: {
      buyer: {
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true
        }
      },
      seller: {
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  });

  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'PENDING').length,
    funded: transactions.filter(t => t.status === 'FUNDED').length,
    released: transactions.filter(t => t.status === 'RELEASED').length,
    disputed: transactions.filter(t => t.status === 'DISPUTED').length,
    totalAmount: transactions
      .filter(t => t.status === 'RELEASED')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RELEASED': return 'bg-green-100 text-green-800';
      case 'FUNDED': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'DISPUTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestão de Pagamentos</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.funded}</div>
            <div className="text-sm text-gray-600">Em Garantia</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.released}</div>
            <div className="text-sm text-gray-600">Liberados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.disputed}</div>
            <div className="text-sm text-gray-600">Em Disputa</div>
          </CardContent>
        </Card>
      </div>

      {/* Total Amount */}
      <Card className="mb-8">
        <CardContent className="p-6 text-center">
          <div className="text-sm text-gray-600 mb-2">Volume Total Processado</div>
          <div className="text-4xl font-bold text-green-600">
            {stats.totalAmount.toFixed(2)} AOA
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comprador</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendedor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900">
                      #{transaction.id.slice(-8)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.buyer.fullName || transaction.buyer.username}
                      </div>
                      <div className="text-sm text-gray-500">{transaction.buyer.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.seller.fullName || transaction.seller.username}
                      </div>
                      <div className="text-sm text-gray-500">{transaction.seller.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {Number(transaction.amount).toFixed(2)} {transaction.currency}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString('pt-AO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}