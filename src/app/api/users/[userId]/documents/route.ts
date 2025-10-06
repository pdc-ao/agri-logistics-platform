// src/app/api/users/[userId]/documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/sessionValidation";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { userId: string };
}

// GET /api/users/[userId]/documents
export const GET = withAuth(
  async (request: NextRequest, { params }: Params, user) => {
    try {
      const { userId } = params;

      // ⚠️ SECURITY: Only allow users to fetch their own documents (or admins)
      if (userId !== user.id && user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Unauthorized - Cannot access other users' documents" },
          { status: 403 }
        );
      }

      const documents = await prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }, // ✅ Changed from submittedAt to createdAt
        select: {
          id: true,
          type: true, // ✅ Changed from docType to type (matches new schema)
          fileName: true, // ✅ Added fileName
          fileUrl: true,
          fileKey: true, // ✅ Added for S3 deletion
          fileSize: true, // ✅ Added
          mimeType: true, // ✅ Added
          status: true,
          rejectionReason: true, // ✅ Changed from notes to rejectionReason
          reviewedBy: true,
          reviewedAt: true,
          createdAt: true, // ✅ Changed from submittedAt
          updatedAt: true, // ✅ Added
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

// ============================================
// OPTIONAL: Add document statistics endpoint
// ============================================

// GET /api/users/[userId]/documents/stats
export const GETStats = withAuth(
  async (request: NextRequest, { params }: Params, user) => {
    try {
      const { userId } = params;

      // Security check
      if (userId !== user.id && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Get counts by status
      const stats = await prisma.document.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
          id: true,
        },
      });

      // Transform to object format
      const statusCounts = {
        PENDING_REVIEW: 0,
        APPROVED: 0,
        REJECTED: 0,
      };

      stats.forEach(stat => {
        statusCounts[stat.status as keyof typeof statusCounts] = stat._count.id;
      });

      return NextResponse.json({
        total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
        ...statusCounts,
      });
    } catch (error) {
      console.error("Error fetching document stats:", error);
      return NextResponse.json(
        { error: "Failed to fetch stats" },
        { status: 500 }
      );
    }
  }
);


// ============================================
// USAGE IN FRONTEND
// ============================================

/*
// Fetch user documents
const response = await fetch(`/api/users/${userId}/documents`);
const data = await response.json();

console.log(data.documents);
// [
//   {
//     id: "doc-123",
//     type: "ID_CARD",
//     fileName: "id-card.jpg",
//     fileUrl: "https://s3.../id-card.jpg",
//     status: "APPROVED",
//     createdAt: "2025-01-01T10:00:00Z"
//   },
//   ...
// ]

// In your DocumentUpload component, this works automatically:
useEffect(() => {
  fetch(`/api/users/${userId}/documents`)
    .then(res => res.json())
    .then(data => setDocuments(data.documents || []))
    .catch(err => console.error('Failed to fetch documents', err));
}, [userId]);
*/