// src/app/api/products/[id]/delete/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const product = await db.productListing.findUnique({
    where: { id: params.id },
  });

  if (!product || product.producerId !== session.user.id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  await db.productListing.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
