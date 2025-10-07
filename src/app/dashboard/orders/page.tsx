'use client';

import { useEffect, useState } from 'react';

interface Order {
  id: string;
  orderDate: string;
  totalAmount: number;
  currency: string;
  orderStatus: string;
  buyer?: { username: string; fullName: string };
  seller?: { username: string; fullName: string };
  transporter?: { username: string; fullName: string };
  storage?: { facilityName: string };
  orderItems: {
    id: string;
    quantityOrdered: number;
    productListing: {
      title: string;
      pricePerUnit: number;
      unitOfMeasure: string;
    };
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p className="p-6">Carregando pedidos...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Meus Pedidos</h1>
      {orders.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">
                  Pedido #{order.id.slice(0, 8)}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(order.orderDate).toLocaleDateString()}
                </span>
              </div>

              <p>
                <strong>Status:</strong> {order.orderStatus}
              </p>
              <p>
                <strong>Total:</strong> {order.totalAmount} {order.currency}
              </p>
              <p>
                <strong>Comprador:</strong>{' '}
                {order.buyer?.fullName || order.buyer?.username}
              </p>
              <p>
                <strong>Vendedor:</strong>{' '}
                {order.seller?.fullName || order.seller?.username}
              </p>
              {order.transporter && (
                <p>
                  <strong>Transportador:</strong>{' '}
                  {order.transporter.fullName || order.transporter.username}
                </p>
              )}
              {order.storage && (
                <p>
                  <strong>Armazém:</strong> {order.storage.facilityName}
                </p>
              )}

              <div className="mt-3">
                <h2 className="font-semibold mb-1">Itens do Pedido:</h2>
                <ul className="list-disc list-inside space-y-1">
                  {order.orderItems.map((item) => (
                    <li key={item.id}>
                      {item.quantityOrdered} × {item.productListing.title} (
                      {item.productListing.pricePerUnit}{' '}
                      {order.currency}/{item.productListing.unitOfMeasure})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
