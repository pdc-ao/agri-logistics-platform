import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateDocumentUpload } from "@/types/documents";
import { DocumentStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const docType = formData.get("docType") as string;
    const userId = formData.get("userId") as string;

    if (!file || !docType || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch user to check entityType and role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, entityType: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate docType for this user
    const validation = validateDocumentUpload(docType, user.entityType, user.role);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // TODO: Upload file to S3/R2/etc. and get a real URL + key
    const fileUrl = `https://storage.example.com/documents/${userId}/${docType}-${Date.now()}.${file.name.split(".").pop()}`;

    // Save document record
    const document = await prisma.document.create({
      data: {
        userId,
        type: docType,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        status: DocumentStatus.PENDING_REVIEW,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
