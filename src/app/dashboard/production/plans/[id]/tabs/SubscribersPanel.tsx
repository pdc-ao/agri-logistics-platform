'use client';

import { useEffect, useState } from 'react';

interface SubscribersPanelProps {
  plan: any;
  isOwner: boolean;
}

export default function SubscribersPanel({ plan, isOwner }: SubscribersPanelProps) {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscribers() {
      try {
        const res = await fetch(`/api/production/plans/${plan.id}/subscribers`);
        if (res.ok) {
          const data = await res.json();
          setSubscribers(data);
        }
      } catch (err) {
        console.error('Failed to load subscribers', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubscribers();
  }, [plan.id]);

  if (loading) {
    return <div className="p-4 text-neutral-500">Loading subscribers…</div>;
  }

  if (subscribers.length === 0) {
    return <div className="p-4 text-neutral-500">No subscribers yet.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Subscribers</h2>
      <table className="w-full text-sm border">
        <thead className="bg-neutral-100">
          <tr>
            <th className="p-2 text-left">User</th>
            <th className="p-2">Email</th>
            <th className="p-2">Subscribed At</th>
            <th className="p-2">Preferences</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.user?.username || s.user?.fullName || s.user?.email}</td>
              <td className="p-2">{s.user?.email}</td>
              <td className="p-2">{new Date(s.subscribedAt).toLocaleDateString()}</td>
              <td className="p-2">
                {[
                  s.notifyOnUpdate && 'Updates',
                  s.notifyOnMilestone && 'Milestones',
                  s.notify15DaysBefore && '15d',
                  s.notify7DaysBefore && '7d',
                  s.notify1DayBefore && '1d',
                  s.notifyOnHarvest && 'Harvest',
                ]
                  .filter(Boolean)
                  .join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
