import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { z } from "zod";

// TODO: integrate real session
async function getSessionUserRole(): Promise<"ADMIN" | string | null> {
  return "ADMIN";
}
async function getSessionUserId(): Promise<string | null> {
  return "admin-user-id";
}

const patchSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED", "PENDING"]),
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = await getSessionUserRole();
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const reviewerId = await getSessionUserId();
    const body = await request.json();
    const parsed = patchSchema.parse(body);

    const { id } = await params;

    const verification = await db.verification.findUnique({ where: { id } });
    if (!verification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    const updated = await db.verification.update({
      where: { id },
      data: {
        status: parsed.status,
        details: parsed.notes || null,
        reviewedAt: new Date(),
        reviewerId: reviewerId || undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[ADMIN VERIFICATION PATCH]", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
