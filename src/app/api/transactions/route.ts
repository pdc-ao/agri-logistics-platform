import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { z } from 'zod';

// TODO: integrate real session / user fetching
async function getSessionUserId(): Promise<string | null> {
  return 'test-user-id';
}

const createSchema = z.object({
  buyerId: z.string(),
  sellerId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('AOA'),
});

const listSchema = z.object({
  buyerId: z.string().optional(),
  sellerId: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createSchema.parse(body);

    if (parsed.buyerId === parsed.sellerId) {
      return NextResponse.json({ error: 'Buyer and seller cannot be the same' }, { status: 400 });
    }

    // Validate users exist
    const [buyer, seller] = await Promise.all([
      db.user.findUnique({ where: { id: parsed.buyerId } }),
      db.user.findUnique({ where: { id: parsed.sellerId } }),
    ]);
    if (!buyer || !seller) {
      return NextResponse.json({ error: 'Buyer or Seller not found' }, { status: 404 });
    }

    const tx = await db.paymentTransaction.create({
      data: {
        buyerId: parsed.buyerId,
        sellerId: parsed.sellerId,
        amount: parsed.amount,
        currency: parsed.currency,
        status: 'PENDING',
      },
    });

    return NextResponse.json(tx, { status: 201 });
  } catch (err) {
    console.error('[ESCROW CREATE]', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = listSchema.parse({
      buyerId: searchParams.get('buyerId') || undefined,
      sellerId: searchParams.get('sellerId') || undefined,
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') || undefined,
    });

    const txs = await db.paymentTransaction.findMany({
      where: {
        ...(parsed.buyerId ? { buyerId: parsed.buyerId } : {}),
        ...(parsed.sellerId ? { sellerId: parsed.sellerId } : {}),
        ...(parsed.status ? { status: parsed.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: parsed.limit || 100,
    });

    return NextResponse.json(txs);
  } catch (err) {
    console.error('[ESCROW LIST]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}