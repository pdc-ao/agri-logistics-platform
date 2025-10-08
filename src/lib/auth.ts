import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth"; // careful: avoid circular import if this is the same file

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    // You can either throw or return a NextResponse
    throw new Error("Not authorized");
    // or: return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return session;
}
