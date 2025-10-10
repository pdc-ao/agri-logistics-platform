import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { z } from "zod";
import { UserRole } from "@prisma/client";

// TODO: integrate real auth
async function getSessionUser(): Promise<{ id: string; role: UserRole }> {
  // Explicitly typed as UserRole, so it can be ADMIN, TRANSFORMER, etc.
  return { id: "transformer-user-id", role: UserRole.TRANSFORMER };
}

const patchSchema = z.object({
  facilityName: z.string().min(2).optional(),
  facilityType: z.string().optional(),
  capacity: z.number().nullable().optional(),
  capacityUnit: z.string().nullable().optional(),
  addressLine1: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
  country: z.string().optional(),
  description: z.string().nullable().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const facility = await db.transformationFacility.findUnique({
      where: { id },
    });
    if (!facility) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(facility);
  } catch (err) {
    console.error("[FACILITY GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = patchSchema.parse(body);

    const { id } = await params;
    const existing = await db.transformationFacility.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.ownerId !== session.id && session.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Transform parsed data for Prisma
    const updateData: any = { ...parsed };
    if (parsed.capacity !== undefined) {
      updateData.capacity =
        parsed.capacity === null ? { set: null } : parsed.capacity;
    }

    const updated = await db.transformationFacility.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[FACILITY PATCH]", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.transformationFacility.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.ownerId !== session.id && session.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await db.transformationFacility.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[FACILITY DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
