// src/app/api/payments/transactions/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (session.user.role === 'ADMIN') {
      // Admins can see all transactions
      if (userId) {
        whereClause.OR = [
          { buyerId: userId },
          { sellerId: userId }
        ];
      }
    } else {
      // Users can only see their own transactions
      whereClause.OR = [
        { buyerId: session.user.id },
        { sellerId: session.user.id }
      ];
    }

    if (status) whereClause.status = status;

    const [transactions, total] = await Promise.all([
      db.paymentTransaction.findMany({
        where: whereClause,
        include: {
          buyer: {
            select: {
              id: true,
              username: true,
              fullName: true,
              email: true
            }
          },
          seller: {
            select: {
              id: true,
              username: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.paymentTransaction.count({ where: whereClause })
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar transações' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { sellerId, amount, currency, orderId } = await request.json();

    if (!sellerId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Create transaction in escrow
    const transaction = await db.paymentTransaction.create({
      data: {
        buyerId: session.user.id,
        sellerId,
        amount,
        currency: currency || 'AOA',
        status: 'FUNDED',
        escrowHeldAt: new Date()
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
      }
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Falha ao criar transação' },
      { status: 500 }
    );
  }
}