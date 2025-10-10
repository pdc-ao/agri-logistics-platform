import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(req: Request, context: any) {
  const session = await getServerSession(authOptions); // ✅ define session
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { planId, userId } = await context.params; // ✅ await params

  // ✅ use db instead of prisma
  const plan = await db.productionPlan.findFirst({
    where: { id: planId, producerId: session.user.id },
  });
  if (!plan) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db.productionSubscriber.delete({
    where: {
      productionPlanId_userId: {
        productionPlanId: planId,
        userId,
      },
    },
  });

  return NextResponse.json({ success: true });
}
