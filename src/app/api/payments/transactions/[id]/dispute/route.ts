// src/app/api/payments/transactions/[id]/dispute/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { reason } = await request.json();
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

    // Check if user is buyer or seller
    const isBuyer = transaction.buyerId === session.user.id;
    const isSeller = transaction.sellerId === session.user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: 'Sem permissão' },
        { status: 403 }
      );
    }

    const updatedTransaction = await db.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: 'DISPUTED'
      }
    });

    // TODO: In production, notify admins and create dispute record
    // await notifyAdmins(transactionId, reason);

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error disputing transaction:', error);
    return NextResponse.json(
      { error: 'Falha ao abrir disputa' },
      { status: 500 }
    );
  }
}