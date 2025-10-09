import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ preOrderId: string }> } // ✅ FIXED
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { preOrderId } = await params; // ✅ FIXED

  const pre = await db.preOrder.findUnique({
    where: { id: preOrderId },
    include: { productionPlan: true },
  });
  if (!pre) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (pre.customerId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (pre.convertedToOrderId)
    return NextResponse.json({ error: "Already converted" }, { status: 400 });

  const order = await db.order.create({
    data: {
      buyerId: pre.customerId,
      sellerId: pre.productionPlan.producerId,
      orderStatus: "PENDING",
      paymentStatus: "PENDING",
      totalAmount: pre.totalPrice ?? 0,
      shippingAddressLine1: "N/A",
      shippingCity: "N/A",
      shippingPostalCode: "0000",
      shippingCountry: "Angola",
      orderItems: {
        create: [
          {
            productListingId: pre.productionPlan.id,
            quantityOrdered: pre.quantity,
            pricePerUnitAtOrder: pre.pricePerUnit ?? 0,
            subtotal: pre.totalPrice ?? 0,
          },
        ],
      },
    },
  });

  await db.preOrder.update({
    where: { id: pre.id },
    data: { convertedToOrderId: order.id, status: "COMPLETED" },
  });

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
