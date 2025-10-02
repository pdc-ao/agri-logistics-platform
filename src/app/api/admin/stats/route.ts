// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    // Get current month start
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      pendingVerifications,
      activeProducers,
      totalOrders,
      currentMonthUsers,
      lastMonthUsers
    ] = await Promise.all([
      db.user.count(),
      db.user.count({
        where: { verificationStatus: 'PENDING' }
      }),
      db.user.count({
        where: {
          role: 'PRODUCER',
          isVerified: true
        }
      }),
      db.order.count(),
      db.user.count({
        where: {
          createdAt: { gte: currentMonthStart }
        }
      }),
      db.user.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lt: currentMonthStart
          }
        }
      })
    ]);

    // Calculate monthly growth
    const monthlyGrowth = lastMonthUsers > 0
      ? Math.round(((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100)
      : 0;

    return NextResponse.json({
      totalUsers,
      pendingVerifications,
      activeProducers,
      totalOrders,
      monthlyGrowth
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar estatísticas' },
      { status: 500 }
    );
  }
}