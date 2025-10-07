'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const OverviewPanel = dynamic(() => import('./tabs/OverviewPanel'));
const SchedulesPanel = dynamic(() => import('./tabs/SchedulesPanel'));
const UpdatesPanel = dynamic(() => import('./tabs/UpdatesPanel'));
const PreOrdersPanel = dynamic(() => import('./tabs/PreOrdersPanel'));
const SubscribersPanel = dynamic(() => import('./tabs/SubscribersPanel'));

interface PlanTabsProps {
  plan: any;
  tab: string;
  isOwner: boolean;
}

export default function PlanTabs({ plan, tab, isOwner }: PlanTabsProps) {
  const [active, setActive] = useState(tab);

  useEffect(() => setActive(tab), [tab]);

  const baseTabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'schedules', label: 'Schedules' },
    { key: 'updates', label: 'Updates' }
  ];

  if (plan.allowPreOrders) baseTabs.push({ key: 'preorders', label: 'Pre-Orders' });
  baseTabs.push({ key: 'subscribers', label: 'Subscribers' });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-neutral-200">
        {baseTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px transition ${
              active === t.key
                ? 'border-green-600 text-green-700 font-medium'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {active === 'overview' && <OverviewPanel plan={plan} />}
      {active === 'schedules' && <SchedulesPanel plan={plan} isOwner={isOwner} />}
      {active === 'updates' && <UpdatesPanel plan={plan} isOwner={isOwner} />}
      {active === 'preorders' && plan.allowPreOrders && <PreOrdersPanel plan={plan} isOwner={isOwner} />}
      {active === 'subscribers' && <SubscribersPanel plan={plan} isOwner={isOwner} />}
    </div>
  );
}