'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface OrderItem {
  id: string;
  quantityOrdered: number;
  pricePerUnitAtOrder: number;
  subtotal: number;
  productListing: { title: string; unitOfMeasure: string };
}

interface OrderDetail {
  id: string;
  orderDate: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  buyer: { fullName?: string; username: string };
  seller: { fullName?: string; username: string };
  transporter?: { fullName?: string; username: string };
  orderItems: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const { orderId } = params;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?orderId=${orderId}`); // You may need a dedicated /api/orders/[id]
        const data = await res.json();
        // If API returns array, pick first
        setOrder(Array.isArray(data) ? data[0] : data);
      } catch (e) {
        console.error(e);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="py-10 text-center text-gray-500">Carregando…</div>
      ) : !order ? (
        <div className="py-10 text-center text-gray-500">Pedido não encontrado</div>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pedido #{order.id}</h1>
            <p className="text-sm text-gray-500">
              Data: {new Date(order.orderDate).toLocaleDateString()}
            </p>
          </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="border rounded p-4">
                  <h2 className="font-semibold mb-3">Itens</h2>
                  <ul className="space-y-2 text-sm">
                    {order.orderItems.map(item => (
                      <li key={item.id} className="flex justify-between border-b last:border-none pb-1">
                        <div>
                          <div className="font-medium">{item.productListing.title}</div>
                          <div className="text-gray-500">
                            {item.quantityOrdered} {item.productListing.unitOfMeasure} × {item.pricePerUnitAtOrder}
                          </div>
                        </div>
                        <div className="font-semibold">
                          {item.subtotal} {order.currency}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-end mt-4 text-sm">
                    <div className="font-bold">
                      Total: {order.totalAmount} {order.currency}
                    </div>
                  </div>
                </div>

                <div className="border rounded p-4 space-y-2">
                  <h2 className="font-semibold mb-3">Status</h2>
                  <div className="text-sm">
                    <span className="font-medium">Pedido:</span> {order.orderStatus}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Pagamento:</span> {order.paymentStatus}
                  </div>
                  {/* Escrow Action Buttons (stub) */}
                  <div className="pt-4 flex flex-wrap gap-2">
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">Confirmar Recebimento</button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Liberar Pagamento</button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">Contestar</button>
                  </div>
                  <p className="text-xs text-gray-500">
                    (Botões são placeholders — implementar endpoints de escrow.)
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border rounded p-4">
                  <h2 className="font-semibold mb-3">Participantes</h2>
                  <div className="text-sm">
                    <div><span className="font-medium">Comprador:</span> {order.buyer.fullName || order.buyer.username}</div>
                    <div><span className="font-medium">Vendedor:</span> {order.seller.fullName || order.seller.username}</div>
                    {order.transporter && (
                      <div><span className="font-medium">Transportador:</span> {order.transporter.fullName || order.transporter.username}</div>
                    )}
                  </div>
                </div>

                <div className="border rounded p-4">
                  <h2 className="font-semibold mb-3">Ações Rápidas</h2>
                  <div className="flex flex-col gap-2 text-sm">
                    <button className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">Mensagem ao Vendedor</button>
                    <button className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">Mensagem ao Transportador</button>
                    <button className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">Criar Reclamação</button>
                  </div>
                </div>
              </div>
            </div>
        </>
      )}
    </div>
  );
}