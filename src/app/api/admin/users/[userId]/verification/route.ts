import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { status, details } = await request.json();
    const { id } = await params; // 👈 note the await

    if (!status || !["VERIFIED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const verification = await db.verification.update({
      where: { id },
      data: {
        status,
        details: details || null,
      },
    });

    return NextResponse.json(verification);
  } catch (error) {
    console.error("Error updating verification:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar verificação" },
      { status: 500 }
    );
  }
}
