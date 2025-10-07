import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

// GET /api/messages/conversations?userId=abc123
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const conversations = await db.conversation.findMany({
      where: {
        participants: {
          some: { id: userId },
        },
      },
      include: {
        participants: {
          select: { id: true, username: true, fullName: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // last message
          select: { id: true, content: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Shape the response
    const result = conversations.map((conv) => ({
      id: conv.id,
      participants: conv.participants,
      lastMessage: conv.messages[0] || null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Falha ao buscar conversas" },
      { status: 500 }
    );
  }
}

// POST /api/messages/conversations
// Body: { participantIds: ["user1","user2",...] }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { participantIds } = body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
      return NextResponse.json(
        { error: "At least two participantIds are required" },
        { status: 400 }
      );
    }

    const conversation = await db.conversation.create({
      data: {
        participants: {
          connect: participantIds.map((id: string) => ({ id })),
        },
      },
      include: {
        participants: { select: { id: true, username: true, fullName: true } },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Falha ao criar conversa" },
      { status: 500 }
    );
  }
}
