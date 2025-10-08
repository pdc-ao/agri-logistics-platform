import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  milestoneName: z.string().min(2),
  milestoneType: z.enum([
    'LAND_PREPARATION','PLANTING','FERTILIZATION','IRRIGATION',
    'PEST_CONTROL','WEEDING','HARVEST_START','HARVEST_COMPLETE',
    'POST_HARVEST','CUSTOM'
  ]),
  scheduledDate: z.string(),
  notifyBefore: z.number().int().min(0).max(90).default(0)
});

export async function POST(
  req: Request,
  { params }: { params: { planId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const plan = await prisma.productionPlan.findFirst({
    where: { id: params.planId, producerId: session.user.id }
  });
  if (!plan) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });

  const schedule = await prisma.productionSchedule.create({
    data: {
      productionPlanId: params.planId,
      milestoneName: parsed.data.milestoneName,
      milestoneType: parsed.data.milestoneType,
      scheduledDate: new Date(parsed.data.scheduledDate),
      notifyBefore: parsed.data.notifyBefore
    }
  });

  // Optional: audit log
  // await prisma.auditLog.create({ data: { action: 'CREATE_SCHEDULE', entityType: 'ProductionSchedule', entityId: schedule.id, userId: session.user.id } });

  return NextResponse.json(schedule, { status: 201 });
}