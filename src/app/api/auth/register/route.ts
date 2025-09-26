import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phoneNumber: z.string().optional(),
  role: z.enum(['PRODUCER', 'CONSUMER', 'STORAGE_OWNER', 'TRANSPORTER', 'TRANSFORMER']),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('Angola'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        passwordHash,
        fullName: validatedData.fullName,
        phoneNumber: validatedData.phoneNumber,
        addressLine1: validatedData.addressLine1,
        city: validatedData.city,
        country: validatedData.country,
        role: validatedData.role,
        verificationStatus: 'PENDING',
      },
    });

    // Create wallet balance
    await db.walletBalance.create({
      data: {
        userId: user.id,
        balance: 0,
      },
    });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}