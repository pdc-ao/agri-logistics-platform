import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const bookingSchema = z.object({
  facilityId: z.string().min(1),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date format",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date format",
  }),
  serviceType: z.string().min(1),
  inputProduct: z.string().min(1),
  desiredOutput: z.string().min(1),
  quantity: z.number().positive(),
  totalCost: z.number().positive(),
  currency: z.string().default("AOA"),
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

    // Ensure facility exists
    const facility = await db.transformationFacility.findUnique({
      where: { id: parsed.data.facilityId },
    });
    if (!facility) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    // Create booking using FacilityBooking model
    const booking = await db.facilityBooking.create({
      data: {
        facilityId: parsed.data.facilityId,
        userId: session.user.id,
        serviceType: parsed.data.serviceType,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        inputProduct: parsed.data.inputProduct,
        desiredOutput: parsed.data.desiredOutput,
        quantity: parsed.data.quantity,
        totalCost: parsed.data.totalCost,
        currency: parsed.data.currency,
        notes: parsed.data.notes ?? null,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error("[TRANSFORMATION BOOKING POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
