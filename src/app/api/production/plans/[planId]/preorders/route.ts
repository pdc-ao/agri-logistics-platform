import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  quantity: z.number().positive(),
  pricePerUnit: z.number().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ✅ await params safely
  const { planId } = await context.params;

  const plan = await db.productionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }
  if (!plan.allowPreOrders) {
    return NextResponse.json({ error: 'Pre-Orders disabled' }, { status: 400 });
  }
  if (plan.producerId === session.user.id) {
    return NextResponse.json({ error: 'Cannot pre-order own plan' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const totalPrice = parsed.data.pricePerUnit
    ? parsed.data.pricePerUnit * parsed.data.quantity
    : null;

  // ✅ use db instead of prisma
  const preOrder = await db.preOrder.create({
    data: {
      productionPlanId: plan.id,
      customerId: session.user.id,
      quantity: parsed.data.quantity,
      pricePerUnit: parsed.data.pricePerUnit,
      totalPrice,
      notes: parsed.data.notes,
    },
  });

  return NextResponse.json(preOrder, { status: 201 });
}
