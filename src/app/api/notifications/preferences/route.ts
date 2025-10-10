import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ✅ use db instead of prisma
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { notificationPreferences: true },
  });

  return NextResponse.json(user?.notificationPreferences || {});
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const prefs = await req.json().catch(() => ({}));

  // ✅ use db instead of prisma
  const updated = await db.user.update({
    where: { id: session.user.id },
    data: { notificationPreferences: prefs },
  });

  return NextResponse.json(updated.notificationPreferences || {});
}
