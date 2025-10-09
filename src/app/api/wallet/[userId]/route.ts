import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> } // ✅ FIXED
) {
  try {
    const { userId } = await params; // ✅ FIXED

    const wallet = await db.walletBalance.findUnique({
      where: { userId },
    });

    if (!wallet) {
      const newWallet = await db.walletBalance.create({
        data: {
          userId,
          balance: 0,
        },
      });
      return NextResponse.json(newWallet);
    }

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("Wallet fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
