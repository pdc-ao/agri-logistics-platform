import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/session-validation";
import { db } from "@/lib/prisma";

// GET /api/documents/me - User fetches their own documents
export const GET = withAuth(async (request: NextRequest, context, user) => {
  try {
    const documents = await db.document.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        fileName: true,
        fileUrl: true,
        fileKey: true,
        fileSize: true,
        mimeType: true,
        status: true,
        rejectionReason: true,
        reviewedBy: true,
        reviewedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get statistics
    const stats = {
      total: documents.length,
      approved: documents.filter((d) => d.status === "APPROVED").length,
      pending: documents.filter((d) => d.status === "PENDING_REVIEW").length,
      rejected: documents.filter((d) => d.status === "REJECTED").length,
    };

    return NextResponse.json({
      documents,
      stats,
    });
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
});
