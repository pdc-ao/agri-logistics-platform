import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const sellerId = searchParams.get('sellerId');
    const transporterId = searchParams.get('transporterId');
    const status = searchParams.get('status');
    
    const orders = await db.order.findMany({
      where: {
        ...(buyerId ? { buyerId } : {}),
        ...(sellerId ? { sellerId } : {}),
        ...(transporterId ? { transporterId } : {}),
        ...(status ? { orderStatus: status } : {}),
      },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            fullName: true,
          }
        },
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
          }
        },
        transporter: {
          select: {
            id: true,
            username: true,
            fullName: true,
          }
        },
        storage: {
          select: {
            id: true,
            facilityName: true,
          }
        },
        orderItems: {
          include: {
            productListing: {
              select: {
                id: true,
                title: true,
                pricePerUnit: true,
                unitOfMeasure: true,
              }
            }
          }
        }
      },
      orderBy: {
        orderDate: 'desc',
      },
    });
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar pedidos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.buyerId || !body.sellerId || !body.totalAmount || 
        !body.shippingAddressLine1 || !body.shippingCity || !body.shippingPostalCode || 
        !body.orderItems || body.orderItems.length === 0) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    // Verificar se o comprador e vendedor existem
    const buyer = await db.user.findUnique({
      where: { id: body.buyerId }
    });
    
    const seller = await db.user.findUnique({
      where: { id: body.sellerId }
    });
    
    if (!buyer || !seller) {
      return NextResponse.json(
        { error: 'Comprador ou vendedor não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar transportador se fornecido
    if (body.transporterId) {
      const transporter = await db.user.findFirst({
        where: {
          id: body.transporterId,
          role: 'TRANSPORTER',
        }
      });
      
      if (!transporter) {
        return NextResponse.json(
          { error: 'Transportador não encontrado' },
          { status: 404 }
        );
      }
    }
    
    // Verificar armazenamento se fornecido
    if (body.storageId) {
      const storage = await db.storageListing.findUnique({
        where: { id: body.storageId }
      });
      
      if (!storage) {
        return NextResponse.json(
          { error: 'Armazém não encontrado' },
          { status: 404 }
        );
      }
    }
    
    // Criar pedido com transação para garantir consistência
    const order = await db.$transaction(async (prisma) => {
      // Criar o pedido principal
      const newOrder = await prisma.order.create({
        data: {
          buyerId: body.buyerId,
          sellerId: body.sellerId,
          transporterId: body.transporterId,
          storageId: body.storageId,
          totalAmount: body.totalAmount,
          currency: body.currency || 'AOA',
          orderStatus: body.orderStatus || 'Pending',
          paymentStatus: body.paymentStatus || 'Pending',
          paymentMethod: body.paymentMethod,
          transactionId: body.transactionId,
          shippingAddressLine1: body.shippingAddressLine1,
          shippingCity: body.shippingCity,
          shippingPostalCode: body.shippingPostalCode,
          shippingCountry: body.shippingCountry || 'Angola',
          notesForSeller: body.notesForSeller,
          notesForTransporter: body.notesForTransporter,
          estimatedDeliveryDate: body.estimatedDeliveryDate ? new Date(body.estimatedDeliveryDate) : null,
        },
      });
      
      // Criar os itens do pedido
      for (const item of body.orderItems) {
        // Verificar se o produto existe e tem estoque suficiente
        const product = await prisma.productListing.findUnique({
          where: { id: item.productListingId }
        });
        
        if (!product) {
          throw new Error(`Produto ${item.productListingId} não encontrado`);
        }
        
        if (product.quantityAvailable < item.quantityOrdered) {
          throw new Error(`Quantidade insuficiente para o produto ${product.title}`);
        }
        
        // Criar o item do pedido
        await prisma.orderItem.create({
          data: {
            orderId: newOrder.id,
            productListingId: item.productListingId,
            quantityOrdered: item.quantityOrdered,
            pricePerUnitAtOrder: item.pricePerUnitAtOrder || product.pricePerUnit,
            subtotal: item.subtotal || (item.quantityOrdered * (item.pricePerUnitAtOrder || product.pricePerUnit)),
          }
        });
        
        // Atualizar o estoque do produto
        await prisma.productListing.update({
          where: { id: item.productListingId },
          data: {
            quantityAvailable: {
              decrement: item.quantityOrdered
            },
            status: product.quantityAvailable - item.quantityOrdered <= 0 ? 'SoldOut' : product.status
          }
        });
      }
      
      return newOrder;
    });
    
    // Buscar o pedido completo com todos os relacionamentos
    const completeOrder = await db.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            productListing: true
          }
        }
      }
    });
    
    return NextResponse.json(completeOrder, { status: 201 });
    
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao criar pedido' },
      { status: 500 }
    );
  }
}