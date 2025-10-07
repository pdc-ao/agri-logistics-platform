import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const form = await req.formData();
  const name = form.get('name')?.toString();
  const contact = form.get('contact')?.toString();
  const location = form.get('location')?.toString();
  if (!name || !contact || !location) {
    return NextResponse.redirect('/dashboard/procurement/suppliers');
  }
  await prisma.supplier.create({
    data: { name, contact, location }
  });
  return NextResponse.redirect('/dashboard/procurement/suppliers');
}

export async function GET() {
  const suppliers = await prisma.supplier.findMany();
  return NextResponse.json(suppliers);
}