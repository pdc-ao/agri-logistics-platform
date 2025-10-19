// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // all, products, storage, transport
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    let results: any = {
      products: [],
      storage: [],
      transport: [],
      total: 0,
    };

    // Search Products
    if (type === 'all' || type === 'products') {
      const productWhere: any = {
        AND: [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      };

      if (category) {
        productWhere.AND.push({ category });
      }

      if (location) {
        productWhere.AND.push({
          OR: [
            { locationAddress: { contains: location, mode: 'insensitive' } },
          ],
        });
      }

      if (minPrice) {
        productWhere.AND.push({ pricePerUnit: { gte: parseFloat(minPrice) } });
      }

      if (maxPrice) {
        productWhere.AND.push({ pricePerUnit: { lte: parseFloat(maxPrice) } });
      }

      const products = await db.productListing.findMany({
        where: productWhere,
        include: {
          producer: {
            select: {
              id: true,
              username: true,
              fullName: true,
              averageRating: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
        skip,
        take: limit,
      });

      const productCount = await db.productListing.count({
        where: productWhere,
      });

      results.products = products;
      results.total += productCount;
    }

    // Search Storage Facilities
    if (type === 'all' || type === 'storage') {
      const storageWhere: any = {
        AND: [
          {
            OR: [
              { facilityName: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { storageType: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      };

      if (location) {
        storageWhere.AND.push({
          OR: [
            { city: { contains: location, mode: 'insensitive' } },
            { addressLine1: { contains: location, mode: 'insensitive' } },
          ],
        });
      }

      const storage = await db.storageListing.findMany({
        where: storageWhere,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              fullName: true,
              averageRating: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
        skip,
        take: limit,
      });

      const storageCount = await db.storageListing.count({
        where: storageWhere,
      });

      results.storage = storage;
      results.total += storageCount;
    }

    // Search Transport Services
    if (type === 'all' || type === 'transport') {
      const transportWhere: any = {
        AND: [
          {
            OR: [
              { serviceTitle: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { vehicleType: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      };

      if (location) {
        transportWhere.AND.push({
          OR: [
            { baseLocationCity: { contains: location, mode: 'insensitive' } },
            {
              operationalRoutes: { contains: location, mode: 'insensitive' },
            },
          ],
        });
      }

      const transport = await db.transportListing.findMany({
        where: transportWhere,
        include: {
          transporter: {
            select: {
              id: true,
              username: true,
              fullName: true,
              averageRating: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
        skip,
        take: limit,
      });

      const transportCount = await db.transportListing.count({
        where: transportWhere,
      });

      results.transport = transport;
      results.total += transportCount;
    }

    return NextResponse.json({
      success: true,
      query,
      type,
      results,
      pagination: {
        page,
        limit,
        total: results.total,
        totalPages: Math.ceil(results.total / limit),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}