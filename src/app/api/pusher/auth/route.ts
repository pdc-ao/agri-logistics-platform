// src/app/api/pusher/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const socketId = formData.get("socket_id") as string;
  const channelName = formData.get("channel_name") as string;

  // Validate user has access to this channel
  const userId = (session.user as any).id;
  
  // Private channels start with "private-"
  if (channelName.startsWith("private-")) {
    const channelUserId = channelName.split("-")[1];
    
    if (channelUserId !== userId && (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Presence channels start with "presence-"
  if (channelName.startsWith("presence-")) {
    const presenceData = {
      user_id: userId,
      user_info: {
        email: session.user.email,
        role: (session.user as any).role,
      },
    };

    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channelName,
      presenceData
    );

    return NextResponse.json(authResponse);
  }

  // Standard private channel
  const authResponse = pusherServer.authorizeChannel(socketId, channelName);
  return NextResponse.json(authResponse);
}