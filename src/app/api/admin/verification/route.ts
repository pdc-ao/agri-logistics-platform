import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const { id, status, notes } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing document id" }, { status: 400 });
    }

    if (!status || !["APPROVED", "REJECTED", "PENDING_REVIEW"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedDoc = await db.document.update({
      where: { id },
      data: {
        status,
        rejectionReason: notes || null,
        reviewedAt: new Date(),
        // reviewedBy: adminId (if you have it from session)
      },
    });

    // Optionally update the user’s verification status
    if (status === "APPROVED") {
      await db.user.update({
        where: { id: updatedDoc.userId },
        data: { verificationStatus: "VERIFIED", isVerified: true },
      });
    } else if (status === "REJECTED") {
      const remainingPending = await db.document.count({
        where: { userId: updatedDoc.userId, status: "PENDING_REVIEW" },
      });
      const anyApproved = await db.document.count({
        where: { userId: updatedDoc.userId, status: "APPROVED" },
      });
      if (remainingPending === 0 && anyApproved === 0) {
        await db.user.update({
          where: { id: updatedDoc.userId },
          data: { verificationStatus: "REJECTED", isVerified: false },
        });
      }
    }

    return NextResponse.json(updatedDoc);
  } catch (error) {
    console.error("Error updating verification:", error);
    return NextResponse.json(
      { error: "Failed to update verification" },
      { status: 500 }
    );
  }
}
