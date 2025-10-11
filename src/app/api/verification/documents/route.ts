// src/app/api/verification/documents/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: list documents for the logged-in user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await db.document.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (err) {
    console.error("[DOCUMENTS GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: upload a new document (metadata only — assumes file already uploaded to storage)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, fileName, fileUrl, fileSize, mimeType, relatedEntityId } = body;

    if (!type || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: "Missing required fields: type, fileName, fileUrl" },
        { status: 400 }
      );
    }

    const document = await db.document.create({
      data: {
        userId: session.user.id,
        type,
        fileName,
        fileUrl,
        fileSize,
        mimeType,
        relatedEntityId,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (err) {
    console.error("[DOCUMENTS POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
