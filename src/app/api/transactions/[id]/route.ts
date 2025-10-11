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

// ---------------- GET ----------------
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); // extract [id] from path
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const tx = await db.paymentTransaction.findUnique({ where: { id } });
    if (!tx) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(tx);
  } catch (err) {
    console.error('[ESCROW GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ---------------- PATCH ----------------
export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = actionSchema.parse(body);
    const txRecord = await db.paymentTransaction.findUnique({ where: { id } });
    if (!txRecord) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // … your state machine logic unchanged, just replace all `params.id` with `id` …
  } catch (err: any) {
    console.error('[ESCROW PATCH]', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 400 });
  }
}
