import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { z } from 'zod';

// TODO: integrate real auth
async function getSessionUser() {
  return { id: 'transformer-user-id', role: 'TRANSFORMER' as const };
}

const createSchema = z.object({
  facilityName: z.string().min(2),
  facilityType: z.string().optional(),
  capacity: z.number().nullable().optional(),   // ✅ allow null explicitly
  capacityUnit: z.string().optional(),
  addressLine1: z.string().min(3),
  city: z.string().min(2),
  country: z.string().default('Angola'),
  description: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId') || undefined;
    const city = searchParams.get('city') || undefined;

    const facilities = await db.transformationFacility.findMany({
      where: {
        ...(ownerId ? { ownerId } : {}),
        ...(city ? { city } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(facilities);
  } catch (err) {
    console.error('[FACILITIES LIST]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!['TRANSFORMER', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createSchema.parse(body);

    // ✅ Build data safely, omit undefined
    const data: any = {
      ownerId: session.id,
      facilityName: parsed.facilityName,
      facilityType: parsed.facilityType,
      capacityUnit: parsed.capacityUnit,
      addressLine1: parsed.addressLine1,
      city: parsed.city,
      country: parsed.country,
      description: parsed.description,
    };

    if (parsed.capacity !== undefined) {
      data.capacity = parsed.capacity; // number or null
    }

    const created = await db.transformationFacility.create({ data });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('[FACILITIES CREATE]', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
