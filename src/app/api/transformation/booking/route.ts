import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const bookingSchema = z.object({
  facilityId: z.string().min(1),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const facility = await db.transformationFacility.findUnique({
      where: { id: parsed.data.facilityId },
    });
    if (!facility) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    const booking = await db.transformationBooking.create({
      data: {
        facilityId: parsed.data.facilityId,
        userId: session.user.id,
        bookingDate: new Date(parsed.data.date),
        notes: parsed.data.notes ?? null,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error("[TRANSFORMATION BOOKING POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
