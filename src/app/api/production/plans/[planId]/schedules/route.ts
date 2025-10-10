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
  notifyBefore: z.number().int().min(0).max(90).default(0),
});

export async function POST(req: Request, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // ✅ await params safely
  const { planId } = await context.params;

  // ✅ use db instead of prisma
  const plan = await db.productionPlan.findFirst({
    where: { id: planId, producerId: session.user.id },
  });

  if (!plan) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
  }

  // ✅ use db instead of prisma
  const schedule = await db.productionSchedule.create({
    data: {
      productionPlanId: planId,
      milestoneName: parsed.data.milestoneName,
      milestoneType: parsed.data.milestoneType,
      scheduledDate: new Date(parsed.data.scheduledDate),
      notifyBefore: parsed.data.notifyBefore,
    },
  });

  // Optional: audit log
  // await db.auditLog.create({
  //   data: {
  //     action: 'CREATE_SCHEDULE',
  //     entityType: 'ProductionSchedule',
  //     entityId: schedule.id,
  //     userId: session.user.id,
  //   },
  // });

  return NextResponse.json(schedule, { status: 201 });
}
