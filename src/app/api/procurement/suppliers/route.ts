import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function POST(req: Request) {
  const form = await req.formData();
  const name = form.get('name')?.toString();
  const contact = form.get('contact')?.toString();
  const location = form.get('location')?.toString();

  if (!name || !contact || !location) {
    return NextResponse.redirect('/dashboard/procurement/suppliers');
  }

  // ✅ use db instead of prisma
  await db.supplier.create({
    data: { name, contact, location },
  });

  return NextResponse.redirect('/dashboard/procurement/suppliers');
}

export async function GET() {
  // ✅ use db instead of prisma
  const suppliers = await db.supplier.findMany();
  return NextResponse.json(suppliers);
}
