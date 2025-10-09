import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/session-validation";
import { db } from "@/lib/prisma";

export const GET = withAuth(
  async (request: NextRequest, { params }: { params: Promise<{ userId: string }> }, user) => {
    try {
      const { userId } = await params;

      if (userId !== user.id && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const stats = await db.document.groupBy({
        by: ["status"],
        where: { userId },
        _count: { id: true },
      });

      const statusCounts = {
        PENDING_REVIEW: 0,
        APPROVED: 0,
        REJECTED: 0,
      };

      stats.forEach((stat) => {
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
