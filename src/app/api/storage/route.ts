import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
  const storages = await db.storageListing.findMany({
    include: { owner: { select: { id: true, username: true, fullName: true, averageRating: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(storages);
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const ownerId = session.user.id;

    // ensure owner exists and has correct role
    const owner = await db.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }
    if (owner.role !== 'STORAGE_OWNER') {
      return NextResponse.json({ error: 'User is not a storage owner' }, { status: 403 });
    }

    const body = await request.json();

    // basic validation (expand as needed)
    if (!body.facilityName || !body.city || !body.addressLine1) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const created = await db.storageListing.create({
      data: {
        ownerId,
        facilityName: body.facilityName,
        description: body.description ?? null,
        storageType: body.storageType ?? null,
        totalCapacity: body.totalCapacity ?? null,
        capacityUnit: body.capacityUnit ?? null,
        availableCapacity: body.availableCapacity ?? null,
        amenities: body.amenities ?? null,
        pricingStructure: body.pricingStructure ?? null,
        responsibilities: body.responsibilities ?? null,
        addressLine1: body.addressLine1,
        city: body.city,
        postalCode: body.postalCode ?? null,
        country: body.country ?? null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        imagesUrls: body.imagesUrls ?? null,
        availabilityStatus: body.availabilityStatus ?? 'Available',
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('POST /api/storage error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}