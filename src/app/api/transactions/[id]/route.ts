import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { z } from 'zod';

// TODO: integrate real session / get user role
async function getSessionUserId(): Promise<string | null> {
  return 'test-user-id';
}
async function getSessionUserRole(): Promise<string | null> {
  return 'ADMIN'; // or USER
}

const actionSchema = z.object({
  action: z.enum([
    'FUND',
    'SELLER_CONFIRM',
    'BUYER_CONFIRM',
    'RELEASE',
    'DISPUTE',
    'REFUND',
    'CANCEL',
  ]),
});

function assert(condition: any, message: string) {
  if (!condition) throw new Error(message);
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tx = await db.paymentTransaction.findUnique({
      where: { id: params.id },
    });
    if (!tx) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(tx);
  } catch (err) {
    console.error('[ESCROW GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = actionSchema.parse(body);
    const txRecord = await db.paymentTransaction.findUnique({
      where: { id: params.id },
    });

    if (!txRecord) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Ownership / admin check for sensitive actions
    const isBuyer = txRecord.buyerId === sessionUserId;
    const isSeller = txRecord.sellerId === sessionUserId;
    const userRole = await getSessionUserRole();
    const isAdmin = userRole === 'ADMIN';

    // Validate state machine
    const current = txRecord.status;
    let nextStatus = current;
    const now = new Date();

    // Some actions will mutate wallet; load wallet rows inside transaction
    const updatedTx = await db.$transaction(async (tx) => {
      // Reload fresh inside transaction
      const fresh = await tx.paymentTransaction.findUnique({
        where: { id: params.id },
        lock: { mode: 'ForUpdate' }, // Ensure serialized transition
      });
      if (!fresh) throw new Error('Transaction vanished');
      const cur = fresh.status;

      switch (parsed.action) {
        case 'FUND':
          assert(isBuyer, 'Only buyer can fund');
          assert(cur === 'PENDING', 'Must be PENDING');
          nextStatus = 'FUNDED';
          return tx.paymentTransaction.update({
            where: { id: params.id },
            data: { status: nextStatus, escrowHeldAt: now },
          });

        case 'SELLER_CONFIRM':
          assert(isSeller, 'Only seller can confirm');
            assert(cur === 'FUNDED', 'Must be FUNDED');
          nextStatus = 'SELLER_CONFIRMED';
          return tx.paymentTransaction.update({
            where: { id: params.id },
            data: { status: nextStatus, sellerConfirmed: true },
          });

        case 'BUYER_CONFIRM':
          assert(isBuyer, 'Only buyer can confirm');
          assert(['FUNDED','SELLER_CONFIRMED'].includes(cur), 'Invalid state for buyer confirm');
          nextStatus = 'BUYER_CONFIRMED';
          return tx.paymentTransaction.update({
            where: { id: params.id },
            data: { status: nextStatus, buyerConfirmed: true },
          });

        case 'RELEASE':
          assert(isAdmin || isBuyer, 'Only buyer or admin can release');
          // For stricter logic, require both confirmations:
          // assert(fresh.sellerConfirmed && fresh.buyerConfirmed, 'Both must confirm before release');
          assert(['BUYER_CONFIRMED','SELLER_CONFIRMED'].includes(cur) || (fresh.buyerConfirmed && fresh.sellerConfirmed),
            'Must be confirmed before release');
          nextStatus = 'RELEASED';

          // Credit seller wallet
          await ensureWallet(tx, fresh.sellerId);
          await tx.walletBalance.update({
            where: { userId: fresh.sellerId },
            data: {
              balance: { increment: fresh.amount },
            },
          });

          return tx.paymentTransaction.update({
            where: { id: params.id },
            data: { status: nextStatus, releasedAt: now },
          });

        case 'DISPUTE':
          assert(isBuyer || isSeller, 'Participants only');
          assert(['FUNDED','SELLER_CONFIRMED','BUYER_CONFIRMED'].includes(cur), 'Cannot dispute now');
          nextStatus = 'DISPUTED';
          return tx.paymentTransaction.update({
            where: { id: params.id },
            data: { status: nextStatus },
          });

        case 'REFUND':
          assert(isAdmin, 'Only admin can refund');
          assert(cur === 'DISPUTED', 'Must be DISPUTED to refund');
          nextStatus = 'REFUNDED';

          // Refund buyer
          await ensureWallet(tx, fresh.buyerId);
          await tx.walletBalance.update({
            where: { userId: fresh.buyerId },
            data: { balance: { increment: fresh.amount } },
          });

          return tx.paymentTransaction.update({
            where: { id: params.id },
            data: { status: nextStatus, releasedAt: now },
          });

        case 'CANCEL':
          assert(isBuyer, 'Only buyer can cancel');
          assert(cur === 'PENDING', 'Cannot cancel now');
          nextStatus = 'CANCELLED';
          return tx.paymentTransaction.update({
            where: { id: params.id },
            data: { status: nextStatus },
          });

        default:
          throw new Error('Unsupported action');
      }
    });

    return NextResponse.json(updatedTx);
  } catch (err: any) {
    console.error('[ESCROW PATCH]', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 400 });
  }
}

async function ensureWallet(tx: any, userId: string) {
  const existing = await tx.walletBalance.findUnique({ where: { userId } });
  if (!existing) {
    await tx.walletBalance.create({
      data: { userId, balance: 0 },
    });
  }
}