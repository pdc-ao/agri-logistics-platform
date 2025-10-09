import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/session-validation";
import { db } from "@/lib/prisma";

export const GET = withAuth(
  async (request: NextRequest, { params }: { params: Promise<{ userId: string }> }, user) => {
    try {
      const { userId } = await params;

      if (userId !== user.id && user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Unauthorized - Cannot access other users' documents" },
          { status: 403 }
        );
      }

      const documents = await db.document.findMany({
        where: { userId },
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

      return NextResponse.json({
        documents,
        count: documents.length,
      });
    } catch (error) {
      console.error("Error fetching user documents:", error);
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      );
    }
  }
);
