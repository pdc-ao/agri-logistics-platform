import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  name: z.string(),
  category: z.string(),
  specs: z.string(),
  supplierId: z.string(),
  stockLevel: z.number().int(),
  unitPrice: z.number()
});

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const component = await prisma.component.create({
    data: parsed.data
  });

  return NextResponse.json(component, { status: 201 });
}

export async function GET() {
  const components = await prisma.component.findMany({
    include: { supplier: true }
  });
  return NextResponse.json(components);
}