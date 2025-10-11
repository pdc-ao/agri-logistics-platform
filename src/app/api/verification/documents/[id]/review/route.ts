// src/app/api/verification/documents/[id]/review/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const session = await requireAdmin();
    const { status, notes } = await request.json();

    // Extract documentId from the URL path
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    const documentId = segments[segments.indexOf("documents") + 1]; // grabs [id]

    if (!documentId) {
      return NextResponse.json({ error: "Missing document id" }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: "Status é obrigatório" }, { status: 400 });
    }

    if (!["APPROVED", "REJECTED", "PENDING_REVIEW"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const document = await db.document.update({
      where: { id: documentId },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? notes : null,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
      include: { user: true },
    });

    // If approved, check if user should be verified
    if (status === "APPROVED") {
      const approvedDocs = await db.document.count({
        where: { userId: document.userId, status: "APPROVED" },
      });

      if (approvedDocs >= 2) {
        await db.user.update({
          where: { id: document.userId },
          data: {
            isVerified: true,
            verificationStatus: "VERIFIED",
            verificationDetails: "Verificado após aprovação de documentos",
          },
        });
      }
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error reviewing document:", error);
    return NextResponse.json(
      { error: "Falha ao revisar documento" },
      { status: 500 }
    );
  }
}
