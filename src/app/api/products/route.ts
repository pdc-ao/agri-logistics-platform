import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category') || undefined;
    const producerId = searchParams.get('producerId') || undefined;
    const q = searchParams.get('q') || undefined;
    const sort = searchParams.get('sort') || 'date_desc';
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '0', 10); // 0 => legacy (array only)

    const orderBy =
      sort === 'price_asc' ? { pricePerUnit: 'asc' } :
      sort === 'price_desc' ? { pricePerUnit: 'desc' } :
      sort === 'qty_desc' ? { quantityAvailable: 'desc' } :
      sort === 'qty_asc' ? { quantityAvailable: 'asc' } :
      sort === 'date_asc' ? { createdAt: 'asc' } :
      { createdAt: 'desc' };

    const whereClause: any = {
      status: 'Active',
      ...(category ? { category } : {}),
      ...(producerId ? { producerId } : {}),
      ...(q ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    };

    if (limit === 0) {
      const products = await db.productListing.findMany({
        where: whereClause,
        include: {
          producer: { select: { id: true, username: true, fullName: true, averageRating: true } },
          reviews: { select: { id: true, rating: true } },
        },
        orderBy,
        take: 200, // safety cap
      });
      return NextResponse.json(products);
    }

    const total = await db.productListing.count({ where: whereClause });

    const products = await db.productListing.findMany({
      where: whereClause,
      include: {
        producer: { select: { id: true, username: true, fullName: true, averageRating: true } },
        reviews: { select: { id: true, rating: true } },
      },
      orderBy,
      skip: page * limit,
      take: limit,
    });

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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

    if (!body.producerId || !body.title || !body.description || !body.category ||
        body.quantityAvailable == null || !body.unitOfMeasure || body.pricePerUnit == null) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const producer = await db.user.findFirst({
      where: { id: body.producerId, role: 'PRODUCER' },
    });

    if (!producer) {
      return NextResponse.json({ error: 'Produtor não encontrado' }, { status: 404 });
    }

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