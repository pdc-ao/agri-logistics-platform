import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        averageRating: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar usuários' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.username || !body.email || !body.passwordHash || !body.role) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    // Verificar se usuário já existe
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: body.email },
          { username: body.username }
        ]
      }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário ou email já existe' },
        { status: 409 }
      );
    }
    
    // Criar usuário
    const user = await db.user.create({
      data: {
        username: body.username,
        email: body.email,
        passwordHash: body.passwordHash, // Deve ser hash, não senha em texto plano
        fullName: body.fullName,
        phoneNumber: body.phoneNumber,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        city: body.city,
        stateProvince: body.stateProvince,
        postalCode: body.postalCode,
        country: body.country || 'Angola',
        latitude: body.latitude,
        longitude: body.longitude,
        role: body.role,
      },
    });
    
    // Criar detalhes específicos baseados no tipo de usuário
    if (body.role === 'PRODUCER' && body.producerDetails) {
      await db.producerDetails.create({
        data: {
          userId: user.id,
          farmName: body.producerDetails.farmName,
          farmDescription: body.producerDetails.farmDescription,
          certifications: body.producerDetails.certifications,
        },
      });
    } else if (body.role === 'STORAGE_OWNER' && body.storageDetails) {
      await db.storageDetails.create({
        data: {
          userId: user.id,
          facilityName: body.storageDetails.facilityName,
          businessRegistrationId: body.storageDetails.businessRegistrationId,
        },
      });
    } else if (body.role === 'TRANSPORTER' && body.transporterDetails) {
      await db.transporterDetails.create({
        data: {
          userId: user.id,
          companyName: body.transporterDetails.companyName,
          driverLicenseId: body.transporterDetails.driverLicenseId,
          vehicleRegistrationDetails: body.transporterDetails.vehicleRegistrationDetails,
        },
      });
    }
    
    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Falha ao criar usuário' },
      { status: 500 }
    );
  }
}