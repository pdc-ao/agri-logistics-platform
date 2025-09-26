import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const wallet = await db.walletBalance.findUnique({
      where: { userId: params.userId },
    });

    if (!wallet) {
      // Create wallet if it doesn't exist
      const newWallet = await db.walletBalance.create({
        data: {
          userId: params.userId,
          balance: 0,
        },
      });
      return NextResponse.json(newWallet);
    }

    return NextResponse.json(wallet);

  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}