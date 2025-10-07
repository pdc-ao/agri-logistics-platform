import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  productName: z.string().min(2),
  productCategory: z.string().min(2),
  variety: z.string().optional(),
  areaSize: z.number().positive(),
  areaUnit: z.string(),
  location: z.string().min(2),
  coordinates: z.string().optional(),
  estimatedQuantity: z.number().positive(),
  quantityUnit: z.string().min(1),
  plantingDate: z.string(),
  estimatedHarvestDate: z.string(),
  isPublic: z.boolean(),
  allowPreOrders: z.boolean(),
  description: z.string().optional(),
  farmingMethod: z.string().optional(),
  certifications: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([])
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Optional: ensure user has PRODUCER role
  // if (session.user.role !== 'PRODUCER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const plan = await prisma.productionPlan.create({
    data: {
      producerId: session.user.id,
      productName: data.productName,
      productCategory: data.productCategory,
      variety: data.variety,
      areaSize: data.areaSize,
      areaUnit: data.areaUnit,
      location: data.location,
      coordinates: data.coordinates,
      estimatedQuantity: data.estimatedQuantity,
      quantityUnit: data.quantityUnit,
      plantingDate: new Date(data.plantingDate),
      estimatedHarvestDate: new Date(data.estimatedHarvestDate),
      isPublic: data.isPublic,
      allowPreOrders: data.allowPreOrders,
      description: data.description,
      farmingMethod: data.farmingMethod,
      certifications: data.certifications,
      images: data.images
    }
  });

  return NextResponse.json(plan, { status: 201 });
}