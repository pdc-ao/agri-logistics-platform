// src/app/api/admin/users/[userId]/verification/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();

    const { status, details } = await request.json();
    const { userId } = await params; // 👈 note the await

    if (!status || !["VERIFIED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        verificationStatus: status,
        isVerified: status === "VERIFIED",
        verificationDetails: details || null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        verificationStatus: true,
        isVerified: true,
        verificationDetails: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating verification status:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar status de verificação" },
      { status: 500 }
    );
  }
}
