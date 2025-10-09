import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();

    const { reason, duration } = await request.json();
    const { userId } = await params; // 👈 note the await

    if (!reason) {
      return NextResponse.json(
        { error: "Motivo da suspensão é obrigatório" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Não é possível suspender outro administrador" },
        { status: 403 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        verificationStatus: "REJECTED",
        isVerified: false,
        verificationDetails: `Conta suspensa: ${reason}`,
      },
    });

    return NextResponse.json({
      message: "Usuário suspenso com sucesso",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        verificationStatus: updatedUser.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Error suspending user:", error);
    return NextResponse.json(
      { error: "Falha ao suspender usuário" },
      { status: 500 }
    );
  }
}
