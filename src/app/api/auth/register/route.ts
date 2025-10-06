import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

// Base schema
const baseSchema = {
  username: z.string().min(3),
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

// Individual schema
const individualSchema = z.object({
  ...baseSchema,
  entityType: z.literal("INDIVIDUAL"),
  fullName: z.string().min(2),
  dateOfBirth: z.string().optional(),
});

// Company schema
const companySchema = z.object({
  ...baseSchema,
  entityType: z.literal("COMPANY"),
  companyName: z.string().min(2),
  registrationNumber: z.string().min(2),
  taxId: z.string().min(2),
  companyType: z.string().optional(),
  incorporationDate: z.string().optional(),
});

// Union schema
const registerSchema = z.union([individualSchema, companySchema]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        passwordHash,
        entityType: validatedData.entityType,
        role: validatedData.role,
        phoneNumber: validatedData.phoneNumber,
        addressLine1: validatedData.addressLine1,
        city: validatedData.city,
        country: validatedData.country,
        verificationStatus: "PENDING",

        // Individual fields
        fullName:
          validatedData.entityType === "INDIVIDUAL"
            ? validatedData.fullName
            : null,
        dateOfBirth:
          validatedData.entityType === "INDIVIDUAL"
            ? validatedData.dateOfBirth
              ? new Date(validatedData.dateOfBirth)
              : null
            : null,

        // Company fields
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

    // Create wallet balance
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
