// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const verificationStatus = searchParams.get('verificationStatus');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (role) whereClause.role = role;
    if (verificationStatus) whereClause.verificationStatus = verificationStatus;
    
    if (search) {
      whereClause.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: whereClause,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          city: true,
          stateProvince: true,
          country: true,
          role: true,
          isVerified: true,
          verificationStatus: true,
          averageRating: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              productListings: true,
              storageListings: true,
              transportListings: true,
              buyerOrders: true,
              sellerOrders: true,
              reviewsGiven: true,
              reviewsReceived: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.user.count({ where: whereClause })
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar usuários' },
      { status: 500 }
    );
  }
}