{ db }import { StatusBadge } from '@/components/ui/status-badge';
import PlanTabs from './tabs';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Props {
  params: { id: string };
  searchParams?: { tab?: string };
}

export default async function PlanDetailPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const plan = await prisma.productionPlan.findUnique({
    where: { id: params.id },
    include: {
      schedules: { orderBy: { scheduledDate: 'asc' } },
      updates: { orderBy: { createdAt: 'desc' }, include: { user: { select: { username: true, id: true } } } },
      preOrders: {
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, username: true } } }
      },
      subscribers: {
        include: { user: { select: { id: true, username: true } } },
        orderBy: { subscribedAt: 'desc' }
      },
      producer: { select: { id: true, username: true } }
    }
  });

  if (!plan) return notFound();

  const activeTab = searchParams?.tab || 'overview';
  const isOwner = session?.user?.id === plan.producerId;

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            {plan.productName}
            {plan.variety && <span className="text-neutral-500 text-sm">({plan.variety})</span>}
          </h1>
          <p className="text-xs text-neutral-500">
            Producer: {plan.producer.username} • Area: {plan.areaSize} {plan.areaUnit}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={plan.status} kind="production" />
          {isOwner && (
            <a
              href={`/dashboard/production/plans/${plan.id}?tab=schedules`}
              className="text-xs underline text-green-700"
            >
              Manage Schedules
            </a>
          )}
        </div>
      </div>
      <PlanTabs plan={plan} tab={activeTab} isOwner={isOwner} />
    </div>
  );
}