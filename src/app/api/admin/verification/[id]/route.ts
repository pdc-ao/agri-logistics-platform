import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { z } from 'zod';

// TODO: integrate real session
async function getSessionUserRole(): Promise<'ADMIN' | string | null> {
  return 'ADMIN';
}
async function getSessionUserId(): Promise<string | null> {
  return 'admin-user-id';
}

const patchSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const role = await getSessionUserRole();
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const reviewerId = await getSessionUserId();
    const body = await request.json();
    const parsed = patchSchema.parse(body);

    const doc = await db.businessDocument.findUnique({
      where: { id: params.id },
    });
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (doc.status !== 'PENDING') {
      return NextResponse.json({ error: 'Document already reviewed' }, { status: 409 });
    }

    const updated = await db.$transaction(async (tx) => {
      const updatedDoc = await tx.businessDocument.update({
        where: { id: params.id },
        data: {
          status: parsed.status,
          notes: parsed.notes,
          reviewedAt: new Date(),
          reviewerId: reviewerId || undefined,
        },
      });

      // Simple heuristic: if at least one APPROVED doc => mark user as VERIFIED
      if (parsed.status === 'APPROVED') {
        // You could require multiple docTypes—customize logic as needed
        await tx.user.update({
          where: { id: doc.userId },
          data: {
            verificationStatus: 'VERIFIED',
            isVerified: true,
          },
        });
      } else if (parsed.status === 'REJECTED') {
        // Optionally set user to REJECTED if all docs are rejected
        const remainingPending = await tx.businessDocument.count({
          where: { userId: doc.userId, status: 'PENDING' },
        });
        const anyApproved = await tx.businessDocument.count({
          where: { userId: doc.userId, status: 'APPROVED' },
        });
        if (remainingPending === 0 && anyApproved === 0) {
          await tx.user.update({
            where: { id: doc.userId },
            data: {
              verificationStatus: 'REJECTED',
              isVerified: false,
            },
          });
        }
      }

      return updatedDoc;
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[ADMIN VERIFICATION PATCH]', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}