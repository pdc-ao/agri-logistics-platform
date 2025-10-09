import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ planId: string; userId: string }> } // ✅ FIXED
) {
  const { planId, userId } = await params; // ✅ FIXED
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plan = await prisma.productionPlan.findFirst({
    where: { id: params.planId, producerId: session.user.id }
  });
  if (!plan) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.productionSubscriber.delete({
    where: {
      productionPlanId_userId: {
        productionPlanId: params.planId,
        userId: params.userId
      }
    }
  });

  return NextResponse.json({ success: true });
}