// src/app/api/payments/transactions/[id]/confirm/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 FIXED
) {
  try {
    const session = await requireAuth();
    const { id: transactionId } = await params; // 👈 FIXED

    const transaction = await db.paymentTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      );
    }

    // Check if user is buyer or seller
    const isBuyer = transaction.buyerId === session.user.id;
    const isSeller = transaction.sellerId === session.user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // Update confirmation
    const updatedTransaction = await db.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        ...(isBuyer && { buyerConfirmed: true }),
        ...(isSeller && { sellerConfirmed: true }),
        status: isSeller ? "SELLER_CONFIRMED" : transaction.status,
      },
    });

    // If both confirmed, release payment
    if (updatedTransaction.buyerConfirmed && updatedTransaction.sellerConfirmed) {
      await db.$transaction(async (prisma) => {
        // Update transaction status
        await prisma.paymentTransaction.update({
          where: { id: transactionId },
          data: {
            status: "RELEASED",
            releasedAt: new Date(),
          },
        });

        // Credit seller's wallet
        await prisma.walletBalance.upsert({
          where: { userId: transaction.sellerId },
          create: {
            userId: transaction.sellerId,
            balance: Number(transaction.amount),
          },
          update: {
            balance: { increment: Number(transaction.amount) },
          },
        });
      });
    }

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error("Error confirming transaction:", error);
    return NextResponse.json(
      { error: "Falha ao confirmar transação" },
      { status: 500 }
    );
  }
}
