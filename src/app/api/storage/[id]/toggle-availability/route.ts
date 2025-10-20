// src/app/api/storage/[id]/toggle-availability/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const facility = await db.storageListing.findUnique({
    where: { id: params.id },
  });

  if (!facility || facility.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const newStatus =
    facility.availabilityStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";

  await db.storageListing.update({
    where: { id: params.id },
    data: { availabilityStatus: newStatus },
  });

  return NextResponse.json({ success: true, status: newStatus });
}
