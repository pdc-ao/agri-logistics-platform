// src/app/api/transformation/facilities/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = params;

    const facility = await db.transformationFacility.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            averageRating: true,
            city: true,
            stateProvince: true
          }
        }
      }
    });

    if (!facility) {
      return NextResponse.json(
        { error: 'Instalação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(facility);
  } catch (error) {
    console.error('Error fetching facility:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar instalação' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = params;
    const body = await request.json();

    const existingFacility = await db.transformationFacility.findUnique({
      where: { id }
    });

    if (!existingFacility) {
      return NextResponse.json(
        { error: 'Instalação não encontrada' },
        { status: 404 }
      );
    }

    if (existingFacility.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para editar esta instalação' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (body.facilityName) updateData.facilityName = body.facilityName;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.facilityType) updateData.facilityType = body.facilityType;
    if (body.capacity !== undefined) updateData.capacity = body.capacity ? parseFloat(body.capacity) : null;
    if (body.capacityUnit) updateData.capacityUnit = body.capacityUnit;
    if (body.addressLine1) updateData.addressLine1 = body.addressLine1;
    if (body.city) updateData.city = body.city;
    if (body.country) updateData.country = body.country;

    const facility = await db.transformationFacility.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            averageRating: true
          }
        }
      }
    });

    return NextResponse.json(facility);
  } catch (error) {
    console.error('Error updating facility:', error);
    return NextResponse.json(
      { error: 'Falha ao atualizar instalação' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = params;

    const facility = await db.transformationFacility.findUnique({
      where: { id }
    });

    if (!facility) {
      return NextResponse.json(
        { error: 'Instalação não encontrada' },
        { status: 404 }
      );
    }

    if (facility.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para deletar esta instalação' },
        { status: 403 }
      );
    }

    await db.transformationFacility.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Instalação removida com sucesso' });
  } catch (error) {
    console.error('Error deleting facility:', error);
    return NextResponse.json(
      { error: 'Falha ao remover instalação' },
      { status: 500 }
    );
  }
}