// src/app/api/wallet/transactions/[userId]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await requireAuth();
    const { userId } = params;

    // Users can only access their own transactions, admins can access any
    if (session.user.role !== 'ADMIN' && userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Sem permissão' },
        { status: 403 }
      );
    }

    const transactions = await db.paymentTransaction.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar transações' },
      { status: 500 }
    );
  }
}