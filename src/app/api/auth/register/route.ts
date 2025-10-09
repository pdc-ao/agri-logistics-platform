import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";          // ✅ use db
import { hash } from "bcrypt";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const registerRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: "Too many registration attempts. Please try again later.",
});

const baseSchema = {
  username: z.string().min(3).optional(),
  email: z.string().email(),
  password: z.string().min(8),
  phoneNumber: z.string().optional(),
  role: z.enum([
    "PRODUCER",
    "CONSUMER",
    "STORAGE_OWNER",
    "TRANSPORTER",
    "TRANSFORMER",
  ]),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("Angola"),
};

const individualSchema = z.object({
  ...baseSchema,
  entityType: z.literal("INDIVIDUAL"),
  fullName: z.string().min(2),
  dateOfBirth: z.string().optional(),
});

const companySchema = z.object({
  ...baseSchema,
  entityType: z.literal("COMPANY"),
  companyName: z.string().min(2),
  registrationNumber: z.string().min(2),
  taxId: z.string().min(2),
  companyType: z.string().optional(),
  incorporationDate: z.string().optional(),
});

const registerSchema = z.union([individualSchema, companySchema]);

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await registerRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username ?? "" },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const passwordHash = await hash(validatedData.password, 12);

    const username =
      validatedData.username ||
      validatedData.email.split("@")[0] + "-" + Date.now();

    // ✅ use db instead of prisma
    const user = await db.user.create({
      data: {
        username,
        email: validatedData.email,
        passwordHash,
        entityType: validatedData.entityType,
        role: validatedData.role,
        phoneNumber: validatedData.phoneNumber,
        addressLine1: validatedData.addressLine1,
        city: validatedData.city,
        country: validatedData.country,
        verificationStatus: "PENDING",
        fullName:
          validatedData.entityType === "INDIVIDUAL"
            ? validatedData.fullName
            : null,
        dateOfBirth:
          validatedData.entityType === "INDIVIDUAL" && validatedData.dateOfBirth
            ? new Date(validatedData.dateOfBirth)
            : null,
        companyName:
          validatedData.entityType === "COMPANY"
            ? validatedData.companyName
            : null,
        registrationNumber:
          validatedData.entityType === "COMPANY"
            ? validatedData.registrationNumber
            : null,
        taxId:
          validatedData.entityType === "COMPANY" ? validatedData.taxId : null,
        companyType:
          validatedData.entityType === "COMPANY"
            ? validatedData.companyType
            : null,
        incorporationDate:
          validatedData.entityType === "COMPANY" && validatedData.incorporationDate
            ? new Date(validatedData.incorporationDate)
            : null,
      },
    });

    // ✅ use db instead of prisma
    await db.walletBalance.create({
      data: {
        userId: user.id,
        balance: 0,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        entityType: user.entityType,
        verificationStatus: user.verificationStatus,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
