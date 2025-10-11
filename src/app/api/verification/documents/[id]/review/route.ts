// src/app/api/verification/documents/[id]/review/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const { status, notes } = await request.json();
    const { id: documentId } = params;

    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      );
    }

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    const document = await db.document.update({
      where: { id: documentId },
      data: {
        status,
        notes,
        reviewedAt: new Date(),
        reviewedBy: session.user.id, // matches your schema field
      },
      include: {
        user: true,
      },
    });

    // If document is approved, check if user should be verified
    if (status === 'APPROVED') {
      const userId = document.userId;

      const approvedDocs = await db.document.count({
        where: {
          userId,
          status: 'APPROVED',
        },
      });

      // Require at least 2 approved documents for verification
      if (approvedDocs >= 2) {
        await db.user.update({
          where: { id: userId },
          data: {
            isVerified: true,
            verificationStatus: 'VERIFIED',
            verificationDetails: 'Verificado após aprovação de documentos',
          },
        });
      }
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error reviewing document:', error);
    return NextResponse.json(
      { error: 'Falha ao revisar documento' },
      { status: 500 }
    );
  }
}
