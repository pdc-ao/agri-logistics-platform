import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const producerId = searchParams.get('producerId');
    
    const products = await db.productListing.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(producerId ? { producerId } : {}),
        status: 'Active',
      },
      include: {
        producer: {
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
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar produtos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.producerId || !body.title || !body.description || !body.category || 
        !body.quantityAvailable || !body.unitOfMeasure || !body.pricePerUnit) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    // Verificar se o produtor existe
    const producer = await db.user.findFirst({
      where: {
        id: body.producerId,
        role: 'PRODUCER',
      }
    });
    
    if (!producer) {
      return NextResponse.json(
        { error: 'Produtor não encontrado' },
        { status: 404 }
      );
    }
    
    // Criar produto
    const product = await db.productListing.create({
      data: {
        producerId: body.producerId,
        title: body.title,
        description: body.description,
        category: body.category,
        subcategory: body.subcategory,
        quantityAvailable: body.quantityAvailable,
        unitOfMeasure: body.unitOfMeasure,
        pricePerUnit: body.pricePerUnit,
        currency: body.currency || 'AOA',
        plannedAvailabilityDate: body.plannedAvailabilityDate ? new Date(body.plannedAvailabilityDate) : null,
        actualAvailabilityDate: body.actualAvailabilityDate ? new Date(body.actualAvailabilityDate) : null,
        locationAddress: body.locationAddress,
        locationLatitude: body.locationLatitude,
        locationLongitude: body.locationLongitude,
        qualityCertifications: body.qualityCertifications,
        imagesUrls: body.imagesUrls,
        videoUrl: body.videoUrl,
        status: body.status || 'Active',
      },
    });
    
    return NextResponse.json(product, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Falha ao criar produto' },
      { status: 500 }
    );
  }
}
