import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const transporterId = searchParams.get('transporterId');
    const baseLocationCity = searchParams.get('baseLocationCity');
    const vehicleType = searchParams.get('vehicleType');
    
    const transportListings = await db.transportListing.findMany({
      where: {
        ...(transporterId ? { transporterId } : {}),
        ...(baseLocationCity ? { baseLocationCity } : {}),
        ...(vehicleType ? { vehicleType } : {}),
        availabilityStatus: 'Available'
      },
      include: {
        transporter: {
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
    
    return NextResponse.json(transportListings);
  } catch (error) {
    console.error('Error fetching transport listings:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar serviços de transporte' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.transporterId || !body.serviceTitle || !body.vehicleType || 
        !body.pricingModel || !body.baseLocationCity) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    // Verificar se o transportador existe
    const transporter = await db.user.findFirst({
      where: {
        id: body.transporterId,
        role: 'TRANSPORTER',
      }
    });
    
    if (!transporter) {
      return NextResponse.json(
        { error: 'Transportador não encontrado' },
        { status: 404 }
      );
    }
    
    // Criar listagem de transporte
    const transportListing = await db.transportListing.create({
      data: {
        transporterId: body.transporterId,
        serviceTitle: body.serviceTitle,
        description: body.description,
        vehicleType: body.vehicleType,
        carryingCapacityWeight: body.carryingCapacityWeight,
        capacityWeightUnit: body.capacityWeightUnit,
        carryingCapacityVolume: body.carryingCapacityVolume,
        capacityVolumeUnit: body.capacityVolumeUnit,
        operationalRoutes: body.operationalRoutes,
        primaryDestinationType: body.primaryDestinationType,
        pricingModel: body.pricingModel,
        baseLocationCity: body.baseLocationCity,
        baseLocationCountry: body.baseLocationCountry || 'Angola',
        availabilityStatus: body.availabilityStatus || 'Available',
        insuranceDetails: body.insuranceDetails,
        imagesUrls: body.imagesUrls,
      },
    });
    
    return NextResponse.json(transportListing, { status: 201 });
    
  } catch (error) {
    console.error('Error creating transport listing:', error);
    return NextResponse.json(
      { error: 'Falha ao criar serviço de transporte' },
      { status: 500 }
    );
  }
}