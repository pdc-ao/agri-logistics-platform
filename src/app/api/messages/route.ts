import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get('senderId');
    const receiverId = searchParams.get('receiverId');
    const conversationId = searchParams.get('conversationId');
    
    // Se temos senderId e receiverId, buscamos ou criamos um conversationId
    let effectiveConversationId = conversationId;
    
    if (!conversationId && senderId && receiverId) {
      // Buscar mensagens existentes entre esses usuários para encontrar o conversationId
      const existingMessage = await db.message.findFirst({
        where: {
          OR: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
          ]
        },
        orderBy: {
          sentAt: 'desc'
        }
      });
      
      if (existingMessage) {
        effectiveConversationId = existingMessage.conversationId;
      } else {
        // Criar um novo ID de conversa se não existir
        effectiveConversationId = `conv_${senderId}_${receiverId}`;
      }
    }
    
    // Buscar mensagens
    const messages = await db.message.findMany({
      where: {
        ...(effectiveConversationId ? { conversationId: effectiveConversationId } : {}),
        ...(senderId && !effectiveConversationId ? { 
          OR: [
            { senderId },
            { receiverId: senderId }
          ]
        } : {})
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePictureUrl: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePictureUrl: true
          }
        }
      },
      orderBy: {
        sentAt: 'asc'
      }
    });
    
    // Se estamos buscando mensagens recebidas, marcar como lidas
    if (receiverId && messages.length > 0) {
      await db.message.updateMany({
        where: {
          receiverId,
          readAt: null
        },
        data: {
          readAt: new Date()
        }
      });
    }
    
    return NextResponse.json({
      conversationId: effectiveConversationId,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar mensagens' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.senderId || !body.receiverId || !body.messageContent) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    // Verificar se o remetente e destinatário existem
    const sender = await db.user.findUnique({
      where: { id: body.senderId }
    });
    
    const receiver = await db.user.findUnique({
      where: { id: body.receiverId }
    });
    
    if (!sender || !receiver) {
      return NextResponse.json(
        { error: 'Remetente ou destinatário não encontrado' },
        { status: 404 }
      );
    }
    
    // Determinar o ID da conversa
    let conversationId = body.conversationId;
    
    if (!conversationId) {
      // Buscar conversa existente
      const existingMessage = await db.message.findFirst({
        where: {
          OR: [
            { senderId: body.senderId, receiverId: body.receiverId },
            { senderId: body.receiverId, receiverId: body.senderId }
          ]
        },
        orderBy: {
          sentAt: 'desc'
        }
      });
      
      if (existingMessage) {
        conversationId = existingMessage.conversationId;
      } else {
        // Criar um novo ID de conversa
        conversationId = `conv_${body.senderId}_${body.receiverId}`;
      }
    }
    
    // Criar mensagem
    const message = await db.message.create({
      data: {
        conversationId,
        senderId: body.senderId,
        receiverId: body.receiverId,
        messageContent: body.messageContent
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });
    
    return NextResponse.json(message, { status: 201 });
    
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Falha ao enviar mensagem' },
      { status: 500 }
    );
  }
}