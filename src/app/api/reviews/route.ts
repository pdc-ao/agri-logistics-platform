import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewerId = searchParams.get('reviewerId');
    const reviewedEntityId = searchParams.get('reviewedEntityId');
    const reviewedEntityType = searchParams.get('reviewedEntityType');
    
    const reviews = await db.review.findMany({
      where: {
        ...(reviewerId ? { reviewerId } : {}),
        ...(reviewedEntityId ? { reviewedEntityId } : {}),
        ...(reviewedEntityType ? { reviewedEntityType } : {}),
        isApprovedByAdmin: true
      },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            fullName: true,
          }
        },
        ...(reviewedEntityType === 'User' ? {
          reviewedUser: {
            select: {
              id: true,
              username: true,
              fullName: true,
            }
          }
        } : {}),
        ...(reviewedEntityType === 'Product' ? {
          reviewedProduct: {
            select: {
              id: true,
              title: true,
            }
          }
        } : {}),
        ...(reviewedEntityType === 'Storage' ? {
          reviewedStorage: {
            select: {
              id: true,
              facilityName: true,
            }
          }
        } : {}),
        ...(reviewedEntityType === 'Transport' ? {
          reviewedTransport: {
            select: {
              id: true,
              serviceTitle: true,
            }
          }
        } : {})
      },
      orderBy: {
        reviewDate: 'desc',
      },
    });
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar avaliações' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.reviewerId || !body.reviewedEntityId || !body.reviewedEntityType || 
        body.rating === undefined || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Dados incompletos ou inválidos' },
        { status: 400 }
      );
    }
    
    // Verificar se o avaliador existe
    const reviewer = await db.user.findUnique({
      where: { id: body.reviewerId }
    });
    
    if (!reviewer) {
      return NextResponse.json(
        { error: 'Avaliador não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar se a entidade avaliada existe
    let entityExists = false;
    
    switch (body.reviewedEntityType) {
      case 'User':
        entityExists = !!(await db.user.findUnique({
          where: { id: body.reviewedEntityId }
        }));
        break;
      case 'Product':
        entityExists = !!(await db.productListing.findUnique({
          where: { id: body.reviewedEntityId }
        }));
        break;
      case 'Storage':
        entityExists = !!(await db.storageListing.findUnique({
          where: { id: body.reviewedEntityId }
        }));
        break;
      case 'Transport':
        entityExists = !!(await db.transportListing.findUnique({
          where: { id: body.reviewedEntityId }
        }));
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de entidade inválido' },
          { status: 400 }
        );
    }
    
    if (!entityExists) {
      return NextResponse.json(
        { error: 'Entidade avaliada não encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar se já existe uma avaliação do mesmo avaliador para a mesma entidade
    const existingReview = await db.review.findFirst({
      where: {
        reviewerId: body.reviewerId,
        reviewedEntityId: body.reviewedEntityId,
        reviewedEntityType: body.reviewedEntityType
      }
    });
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'Você já avaliou esta entidade' },
        { status: 409 }
      );
    }
    
    // Criar avaliação
    const review = await db.review.create({
      data: {
        reviewerId: body.reviewerId,
        reviewedEntityId: body.reviewedEntityId,
        reviewedEntityType: body.reviewedEntityType,
        rating: body.rating,
        comment: body.comment,
        isApprovedByAdmin: true, // Por padrão, aprovamos automaticamente
      },
    });
    
    // Atualizar a média de avaliação se for um usuário
    if (body.reviewedEntityType === 'User') {
      const userReviews = await db.review.findMany({
        where: {
          reviewedEntityId: body.reviewedEntityId,
          reviewedEntityType: 'User',
          isApprovedByAdmin: true
        },
        select: {
          rating: true
        }
      });
      
      const averageRating = userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length;
      
      await db.user.update({
        where: { id: body.reviewedEntityId },
        data: {
          averageRating
        }
      });
    }
    
    return NextResponse.json(review, { status: 201 });
    
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Falha ao criar avaliação' },
      { status: 500 }
    );
  }
}