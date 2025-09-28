import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { z } from 'zod';

// TODO: integrate real auth
async function getSessionUser() {
  return { id: 'transformer-user-id', role: 'TRANSFORMER' as const };
}

const patchSchema = z.object({
  facilityName: z.string().min(2).optional(),
  facilityType: z.string().optional(),
  capacity: z.number().nullable().optional(),
  capacityUnit: z.string().nullable().optional(),
  addressLine1: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
  country: z.string().optional(),
  description: z.string().nullable().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const facility = await db.transformationFacility.findUnique({
      where: { id: params.id },
    });
    if (!facility) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(facility);
  } catch (err) {
    console.error('[FACILITY GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = patchSchema.parse(body);

    const existing = await db.transformationFacility.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existing.ownerId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updated = await db.transformationFacility.update({
      where: { id: params.id },
      data: {
        ...parsed,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[FACILITY PATCH]', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const existing = await db.transformationFacility.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (existing.ownerId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await db.transformationFacility.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[FACILITY DELETE]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}