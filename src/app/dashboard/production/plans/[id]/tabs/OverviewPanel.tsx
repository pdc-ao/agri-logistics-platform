'use client';

import { StatusBadge } from '@/components/ui/status-badge';

export default function OverviewPanel({ plan }: { plan: any }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Status">
          <StatusBadge status={plan.status} kind="production" />
        </Stat>
        <Stat label="Area">{plan.areaSize} {plan.areaUnit}</Stat>
        <Stat label="Est. Quantity">{plan.estimatedQuantity} {plan.quantityUnit}</Stat>
        <Stat label="Planting">{new Date(plan.plantingDate).toLocaleDateString()}</Stat>
        <Stat label="Est. Harvest">{new Date(plan.estimatedHarvestDate).toLocaleDateString()}</Stat>
        <Stat label="Public">{plan.isPublic ? 'Yes' : 'No'}</Stat>
        <Stat label="Allow Pre-Orders">{plan.allowPreOrders ? 'Yes' : 'No'}</Stat>
        <Stat label="Schedules">{plan.schedules.length}</Stat>
        <Stat label="Updates">{plan.updates.length}</Stat>
      </div>

      {plan.description && (
        <section className="border rounded p-4 bg-white">
          <h3 className="text-sm font-semibold mb-2">Description</h3>
          <p className="text-sm leading-relaxed whitespace-pre-line">{plan.description}</p>
        </section>
      )}

      {plan.certifications?.length > 0 && (
        <section className="border rounded p-4 bg-white">
          <h3 className="text-sm font-semibold mb-2">Certifications</h3>
          <div className="flex flex-wrap gap-2">
            {plan.certifications.map((c: string) => (
              <span
                key={c}
                className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium"
              >
                {c}
              </span>
            ))}
          </div>
        </section>
      )}

      {plan.images?.length > 0 && (
        <section className="border rounded p-4 bg-white">
          <h3 className="text-sm font-semibold mb-2">Images</h3>
          <div className="flex flex-wrap gap-2">
            {plan.images.map((url: string) => (
              <a
                key={url}
                href={url}
                target="_blank"
                className="text-xs underline text-green-700 break-all"
              >
                {url}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border rounded p-3 bg-white">
      <div className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-sm font-medium">{children}</div>
    </div>
  );
}