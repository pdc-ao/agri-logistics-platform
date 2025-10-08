import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  updateType: z.enum([
    'PROGRESS_UPDATE','MILESTONE_REACHED','ISSUE_REPORTED','QUANTITY_CHANGE',
    'DATE_CHANGE','WEATHER_IMPACT','PEST_DISEASE','GENERAL'
  ]),
  title: z.string().min(3),
  description: z.string().min(5),
  images: z.array(z.string()).default([]),
  currentGrowthStage: z.string().optional(),
  healthStatus: z.string().optional(),
  quantityAdjustment: z.number().optional(),
  dateAdjustment: z.string().optional()
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
  if (!plan) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const update = await prisma.productionUpdate.create({
    data: {
      productionPlanId: params.planId,
      updateType: parsed.data.updateType,
      title: parsed.data.title,
      description: parsed.data.description,
      images: parsed.data.images,
      currentGrowthStage: parsed.data.currentGrowthStage,
      healthStatus: parsed.data.healthStatus,
      quantityAdjustment: parsed.data.quantityAdjustment,
      dateAdjustment: parsed.data.dateAdjustment
        ? new Date(parsed.data.dateAdjustment)
        : undefined,
      createdBy: session.user.id
    }
  });

  return NextResponse.json(update, { status: 201 });
}