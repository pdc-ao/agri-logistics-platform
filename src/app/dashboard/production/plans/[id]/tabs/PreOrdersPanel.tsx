'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/ui/status-badge';

export default function PreOrdersPanel({ plan, isOwner }: { plan: any; isOwner: boolean }) {
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [notes, setNotes] = useState('');

  const submit = async () => {
    const q = parseFloat(quantity);
    const p = pricePerUnit ? parseFloat(pricePerUnit) : undefined;
    if (isNaN(q) || q <= 0) return alert('Invalid quantity');

    const res = await fetch(`/api/production/plans/${plan.id}/preorders`, {
      method: 'POST',
      body: JSON.stringify({ quantity: q, pricePerUnit: p, notes: notes || undefined }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) location.reload();
    else alert('Failed to create pre-order');
  };

  const convert = async (id: string) => {
    const res = await fetch(`/api/preorders/${id}/convert`, { method: 'POST' });
    if (res.ok) location.reload();
    else alert('Conversion failed');
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="font-medium text-sm">Pre-Orders</h2>
        {!isOwner && (
          <button
            onClick={() => setAdding(a => !a)}
            className="px-3 py-1 text-sm rounded bg-green-600 text-white"
          >
            {adding ? 'Cancel' : 'New Pre-Order'}
          </button>
        )}
      </div>

      {!plan.allowPreOrders && (
        <div className="text-xs text-neutral-500">Pre-Orders disabled for this plan.</div>
      )}

      {adding && plan.allowPreOrders && !isOwner && (
        <div className="border rounded p-4 grid gap-3 bg-neutral-50">
          <div className="grid md:grid-cols-3 gap-3">
            <label className="text-xs space-y-1 font-medium">
              <span>Quantity</span>
              <input
                type="number"
                className="field"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
            </label>
            <label className="text-xs space-y-1 font-medium">
              <span>Price / Unit (optional)</span>
              <input
                type="number"
                className="field"
                value={pricePerUnit}
                onChange={e => setPricePerUnit(e.target.value)}
              />
            </label>
            <label className="text-xs space-y-1 font-medium">
              <span>Notes (optional)</span>
              <input
                className="field"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={submit}
              className="px-4 py-1.5 rounded bg-green-600 text-white text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-4 py-1.5 rounded bg-neutral-200 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <table className="w-full text-sm border">
        <thead className="bg-neutral-100">
          <tr>
            <th className="p-2 text-left">Customer</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Price/Unit</th>
            <th className="p-2">Total</th>
            <th className="p-2">Deposit</th>
            <th className="p-2">Status</th>
            <th className="p-2">Created</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {plan.preOrders.map((po: any) => (
            <tr key={po.id} className="border-t">
              <td className="p-2">{po.customer?.username || po.customerId.slice(0, 8)}</td>
              <td className="p-2">{po.quantity}</td>
              <td className="p-2">{po.pricePerUnit ?? '-'}</td>
              <td className="p-2">{po.totalPrice ?? '-'}</td>
              <td className="p-2">
                {po.depositAmount
                  ? `${po.depositAmount} ${po.depositPaid ? '✓' : '✗'}`
                  : '-'}
              </td>
              <td className="p-2">
                <StatusBadge status={po.status} kind="preorder" />
              </td>
              <td className="p-2 text-xs">
                {new Date(po.createdAt).toLocaleDateString()}
              </td>
              <td className="p-2">
                {po.status === 'CONFIRMED' && !po.convertedToOrderId && !isOwner && (
                  <button
                    onClick={() => convert(po.id)}
                    className="text-xs px-2 py-1 bg-green-600 text-white rounded"
                  >
                    Convert
                  </button>
                )}
                {po.convertedToOrderId && (
                  <a
                    href={`/orders/${po.convertedToOrderId}`}
                    className="text-xs underline text-green-700"
                  >
                    View Order
                  </a>
                )}
              </td>
            </tr>
          ))}
          {plan.preOrders.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="p-4 text-center text-sm text-neutral-500"
              >
                No pre-orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}