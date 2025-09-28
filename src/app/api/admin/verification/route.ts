import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { z } from 'zod';

// TODO: integrate with real session / auth:
async function getSessionUserRole(): Promise<'ADMIN' | string | null> {
  // Replace with next-auth session or JWT decode
  return 'ADMIN';
}

const querySchema = z.object({
  status: z.string().optional(),      // PENDING | APPROVED | REJECTED
  userId: z.string().optional(),
  docType: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).optional(),
});

export async function GET(request: Request) {
  try {
    const role = await getSessionUserRole();
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.parse({
      status: searchParams.get('status') || undefined,
      userId: searchParams.get('userId') || undefined,
      docType: searchParams.get('docType') || undefined,
      limit: searchParams.get('limit') || undefined,
    });

    const docs = await db.businessDocument.findMany({
      where: {
        ...(parsed.status ? { status: parsed.status } : {}),
        ...(parsed.userId ? { userId: parsed.userId } : {}),
        ...(parsed.docType ? { docType: parsed.docType } : {}),
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, verificationStatus: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: parsed.limit || 100,
    });

    return NextResponse.json(docs);
  } catch (err) {
    console.error('[ADMIN VERIFICATION GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}