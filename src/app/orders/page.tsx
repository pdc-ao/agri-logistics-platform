'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface OrderListItem {
  id: string;
  orderDate: string;
  orderStatus: string;
  totalAmount: number;
  currency: string;
  buyer: { fullName?: string; username: string };
  seller: { fullName?: string; username: string };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleView, setRoleView] = useState<'buyer'|'seller'|'transporter'>('buyer');
  const userId = 'replace-with-session-id';

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const param =
          roleView === 'buyer' ? `buyerId=${userId}` :
          roleView === 'seller' ? `sellerId=${userId}` :
          `transporterId=${userId}`;
        const res = await fetch(`/api/orders?${param}`);
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [roleView, userId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setRoleView('buyer')}
            className={`px-3 py-1 rounded text-sm ${roleView==='buyer'?'bg-green-600 text-white':'bg-gray-100'}`}
          >Como Comprador</button>
          <button
            onClick={() => setRoleView('seller')}
            className={`px-3 py-1 rounded text-sm ${roleView==='seller'?'bg-green-600 text-white':'bg-gray-100'}`}
          >Como Vendedor</button>
          <button
            onClick={() => setRoleView('transporter')}
            className={`px-3 py-1 rounded text-sm ${roleView==='transporter'?'bg-green-600 text-white':'bg-gray-100'}`}
          >Transportador</button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Carregando...</div>
      ) : orders.length === 0 ? (
        <div className="py-10 text-center text-gray-500">Nenhum pedido encontrado</div>
      ) : (
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">ID</th>
                <th className="text-left px-4 py-2">Data</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Comprador</th>
                <th className="text-left px-4 py-2">Vendedor</th>
                <th className="text-left px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link href={`/dashboard/orders/${o.id}`} className="text-green-600 underline">
                      {o.id.slice(0,8)}…
                    </Link>
                  </td>
                  <td className="px-4 py-2">{new Date(o.orderDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{o.orderStatus}</td>
                  <td className="px-4 py-2">{o.buyer.fullName || o.buyer.username}</td>
                  <td className="px-4 py-2">{o.seller.fullName || o.seller.username}</td>
                  <td className="px-4 py-2 font-semibold">{o.totalAmount} {o.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}