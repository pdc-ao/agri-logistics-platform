import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// NOTE: This is a simplified placeholder. Adjust mapping to real product listing & logistics.
export async function POST(
  _req: Request,
  { params }: { params: { preOrderId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pre = await prisma.preOrder.findUnique({
    where: { id: params.preOrderId },
    include: { productionPlan: true }
  });
  if (!pre) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (pre.customerId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (pre.convertedToOrderId)
    return NextResponse.json({ error: 'Already converted' }, { status: 400 });

  // TODO: Derive a valid productListingId or create a listing associated with the plan.
  // For now we skip creating OrderItems if no listing is known (or you can abort here).
  // If you do have a mapping, replace productListingId: '' below.

  const order = await prisma.order.create({
    data: {
      buyerId: pre.customerId,
      sellerId: pre.productionPlan.producerId,
      orderStatus: 'PENDING',
      paymentStatus: 'PENDING',
      totalAmount: pre.totalPrice ?? 0,
      shippingAddressLine1: 'N/A',
      shippingCity: 'N/A',
      shippingPostalCode: '0000',
      shippingCountry: 'Angola',
      orderItems: {
        create: [
          {
            productListingId: pre.productionPlan.id, // <--- Replace with actual listing if available
            quantityOrdered: pre.quantity,
            pricePerUnitAtOrder: pre.pricePerUnit ?? 0,
            subtotal: pre.totalPrice ?? 0
          }
        ]
      }
    }
  });

  await prisma.preOrder.update({
    where: { id: pre.id },
    data: { convertedToOrderId: order.id, status: 'COMPLETED' }
  });

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}