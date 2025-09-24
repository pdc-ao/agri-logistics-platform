import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const city = searchParams.get('city');
    const storageType = searchParams.get('storageType');
    
    const storageListings = await db.storageListing.findMany({
      where: {
        ...(ownerId ? { ownerId } : {}),
        ...(city ? { city } : {}),
        ...(storageType ? { storageType } : {}),
        availabilityStatus: {
          in: ['Available', 'PartiallyAvailable']
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            averageRating: true,
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            reviewDate: true,
            reviewer: {
              select: {
                id: true,
                username: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(storageListings);
  } catch (error) {
    console.error('Error fetching storage listings:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar armazéns' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.ownerId || !body.facilityName || !body.description || !body.storageType || 
        !body.addressLine1 || !body.city || !body.postalCode || 
        body.latitude === undefined || body.longitude === undefined) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    // Verificar se o proprietário existe
    const owner = await db.user.findFirst({
      where: {
        id: body.ownerId,
        role: 'STORAGE_OWNER',
      }
    });
    
    if (!owner) {
      return NextResponse.json(
        { error: 'Proprietário de armazém não encontrado' },
        { status: 404 }
      );
    }
    
    // Criar listagem de armazém
    const storageListing = await db.storageListing.create({
      data: {
        ownerId: body.ownerId,
        facilityName: body.facilityName,
        description: body.description,
        storageType: body.storageType,
        totalCapacity: body.totalCapacity,
        capacityUnit: body.capacityUnit,
        availableCapacity: body.availableCapacity,
        amenities: body.amenities,
        pricingStructure: body.pricingStructure,
        responsibilities: body.responsibilities,
        addressLine1: body.addressLine1,
        city: body.city,
        postalCode: body.postalCode,
        country: body.country || 'Angola',
        latitude: body.latitude,
        longitude: body.longitude,
        imagesUrls: body.imagesUrls,
        availabilityStatus: body.availabilityStatus || 'Available',
      },
    });
    
    return NextResponse.json(storageListing, { status: 201 });
    
  } catch (error) {
    console.error('Error creating storage listing:', error);
    return NextResponse.json(
      { error: 'Falha ao criar listagem de armazém' },
      { status: 500 }
    );
  }
}