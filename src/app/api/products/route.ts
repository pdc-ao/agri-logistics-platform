// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const producerId = searchParams.get('producerId');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      status: 'Active',
      quantityAvailable: { gt: 0 }
    };

    if (category) whereClause.category = category;
    if (subcategory) whereClause.subcategory = subcategory;
    if (producerId) whereClause.producerId = producerId;
    if (minPrice) whereClause.pricePerUnit = { ...whereClause.pricePerUnit, gte: parseFloat(minPrice) };
    if (maxPrice) whereClause.pricePerUnit = { ...whereClause.pricePerUnit, lte: parseFloat(maxPrice) };
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (city) {
      whereClause.OR = whereClause.OR || [];
      whereClause.OR.push(
        { locationAddress: { contains: city, mode: 'insensitive' } },
        { producer: { city: { contains: city, mode: 'insensitive' } } }
      );
    }

    // Build order clause
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.pricePerUnit = sortOrder;
    } else if (sortBy === 'rating') {
      orderBy.producer = { averageRating: sortOrder };
    } else if (sortBy === 'quantity') {
      orderBy.quantityAvailable = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [products, total] = await Promise.all([
      db.productListing.findMany({
        where: whereClause,
        include: {
          producer: {
            select: {
              id: true,
              username: true,
              fullName: true,
              averageRating: true,
              city: true,
              stateProvince: true,
              isVerified: true,
              profilePictureUrl: true,
              producerDetails: {
                select: {
                  farmName: true,
                  certifications: true
                }
              }
            }
          },
          reviews: {
            where: {
              isApprovedByAdmin: true
            },
            select: {
              id: true,
              rating: true,
              comment: true,
              reviewDate: true,
              reviewer: {
                select: {
                  id: true,
                  username: true,
                  fullName: true
                }
              }
            },
            orderBy: {
              reviewDate: 'desc'
            },
            take: 5
          },
          _count: {
            select: {
              reviews: {
                where: {
                  isApprovedByAdmin: true
                }
              },
              orderItems: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.productListing.count({ where: whereClause })
    ]);

    // Calculate average rating for each product
    const productsWithRatings = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : null,
      totalReviews: product._count.reviews,
      totalSales: product._count.orderItems
    }));

    return NextResponse.json({
      products: productsWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar produtos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validação básica
    if (!body.title || !body.description || !body.category || 
        !body.quantityAvailable || !body.unitOfMeasure || !body.pricePerUnit) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é um produtor
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        producerDetails: true
      }
    });

    if (!user || user.role !== 'PRODUCER') {
      return NextResponse.json(
        { error: 'Apenas produtores podem criar listagens de produtos' },
        { status: 403 }
      );
    }

    // Processar imagens URLs se fornecidas
    let imagesUrls = null;
    if (body.imagesUrls && Array.isArray(body.imagesUrls)) {
      imagesUrls = body.imagesUrls.filter(url => url && typeof url === 'string');
    }

    // Criar produto
    const product = await db.productListing.create({
      data: {
        producerId: session.user.id,
        title: body.title.trim(),
        description: body.description.trim(),
        category: body.category,
        subcategory: body.subcategory?.trim() || null,
        quantityAvailable: parseFloat(body.quantityAvailable),
        unitOfMeasure: body.unitOfMeasure,
        pricePerUnit: parseFloat(body.pricePerUnit),
        currency: body.currency || 'AOA',
        plannedAvailabilityDate: body.plannedAvailabilityDate ? new Date(body.plannedAvailabilityDate) : null,
        actualAvailabilityDate: body.actualAvailabilityDate ? new Date(body.actualAvailabilityDate) : null,
        locationAddress: body.locationAddress?.trim() || null,
        locationLatitude: body.locationLatitude ? parseFloat(body.locationLatitude) : null,
        locationLongitude: body.locationLongitude ? parseFloat(body.locationLongitude) : null,
        qualityCertifications: body.qualityCertifications?.trim() || null,
        imagesUrls: imagesUrls,
        videoUrl: body.videoUrl?.trim() || null,
        status: body.status || 'Active',
      },
      include: {
        producer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            averageRating: true,
            city: true,
            stateProvince: true,
            producerDetails: {
              select: {
                farmName: true,
                certifications: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json(product, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Falha ao criar produto' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, ...updateData } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'ID do produto é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o produto existe e pertence ao usuário
    const existingProduct = await db.productListing.findUnique({
      where: { id: productId },
      include: {
        producer: true
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    if (existingProduct.producerId !== session.user.id && existingProduct.producer.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para editar este produto' },
        { status: 403 }
      );
    }

    // Processar dados de atualização
    const processedUpdateData: any = {};
    
    if (updateData.title) processedUpdateData.title = updateData.title.trim();
    if (updateData.description) processedUpdateData.description = updateData.description.trim();
    if (updateData.category) processedUpdateData.category = updateData.category;
    if (updateData.subcategory) processedUpdateData.subcategory = updateData.subcategory.trim();
    if (updateData.quantityAvailable !== undefined) processedUpdateData.quantityAvailable = parseFloat(updateData.quantityAvailable);
    if (updateData.unitOfMeasure) processedUpdateData.unitOfMeasure = updateData.unitOfMeasure;
    if (updateData.pricePerUnit !== undefined) processedUpdateData.pricePerUnit = parseFloat(updateData.pricePerUnit);
    if (updateData.currency) processedUpdateData.currency = updateData.currency;
    if (updateData.plannedAvailabilityDate) processedUpdateData.plannedAvailabilityDate = new Date(updateData.plannedAvailabilityDate);
    if (updateData.actualAvailabilityDate) processedUpdateData.actualAvailabilityDate = new Date(updateData.actualAvailabilityDate);
    if (updateData.locationAddress) processedUpdateData.locationAddress = updateData.locationAddress.trim();
    if (updateData.locationLatitude !== undefined) processedUpdateData.locationLatitude = parseFloat(updateData.locationLatitude);
    if (updateData.locationLongitude !== undefined) processedUpdateData.locationLongitude = parseFloat(updateData.locationLongitude);
    if (updateData.qualityCertifications) processedUpdateData.qualityCertifications = updateData.qualityCertifications.trim();
    if (updateData.videoUrl) processedUpdateData.videoUrl = updateData.videoUrl.trim();
    if (updateData.status) processedUpdateData.status = updateData.status;

    // Processar imagens URLs se fornecidas
    if (updateData.imagesUrls && Array.isArray(updateData.imagesUrls)) {
      processedUpdateData.imagesUrls = updateData.imagesUrls.filter(url => url && typeof url === 'string');
    }

    // Atualizar produto
    const updatedProduct = await db.productListing.update({
      where: { id: productId },
      data: processedUpdateData,
      include: {
        producer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            averageRating: true,
            city: true,
            stateProvince: true,
            producerDetails: {
              select: {
                farmName: true,
                certifications: true
              }
            }
          }
        },
        reviews: {
          where: {
            isApprovedByAdmin: true
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            reviewDate: true,
            reviewer: {
              select: {
                id: true,
                username: true,
                fullName: true
              }
            }
          },
          orderBy: {
            reviewDate: 'desc'
          },
          take: 5
        }
      }
    });
    
    return NextResponse.json(updatedProduct);
    
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Falha ao atualizar produto' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'ID do produto é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o produto existe e pertence ao usuário
    const existingProduct = await db.productListing.findUnique({
      where: { id: productId },
      include: {
        producer: true,
        orderItems: true
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    if (existingProduct.producerId !== session.user.id && existingProduct.producer.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para deletar este produto' },
        { status: 403 }
      );
    }

    // Verificar se há pedidos pendentes para este produto
    const pendingOrders = await db.orderItem.count({
      where: {
        productListingId: productId,
        order: {
          orderStatus: {
            in: ['Pending', 'Processing', 'Shipped']
          }
        }
      }
    });

    if (pendingOrders > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar produto com pedidos pendentes' },
        { status: 400 }
      );
    }

    // Marcar como inativo ao invés de deletar (soft delete)
    await db.productListing.update({
      where: { id: productId },
      data: {
        status: 'Deleted',
        quantityAvailable: 0
      }
    });
    
    return NextResponse.json({ message: 'Produto removido com sucesso' });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Falha ao remover produto' },
      { status: 500 }
    );
  }
}