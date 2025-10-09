// src/app/api/payments/transactions/[id]/release/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: transactionId } = params;

    const transaction = await db.paymentTransaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      );
    }

    // Only buyer can manually release payment
    if (transaction.buyerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Apenas o comprador pode liberar o pagamento' },
        { status: 403 }
      );
    }

    await db.$transaction(async (prisma) => {
      // Update transaction status
      await prisma.paymentTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
          buyerConfirmed: true
        }
      });

      // Credit seller's wallet
      await prisma.walletBalance.upsert({
        where: { userId: transaction.sellerId },
        create: {
          userId: transaction.sellerId,
          balance: Number(transaction.amount)
        },
        update: {
          balance: { increment: Number(transaction.amount) }
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error releasing payment:', error);
    return NextResponse.json(
      { error: 'Falha ao liberar pagamento' },
      { status: 500 }
    );
  }
}