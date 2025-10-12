import { db } from "./prisma";

// src/lib/metrics.ts
export async function trackApiMetric(
  endpoint: string,
  duration: number,
  status: number,
  userId?: string
) {
  try {
  await db.auditLog.create({
    data: {
     userId,
     action: "API_CALL",
     entityType: "ENDPOINT",
     entityId: endpoint,
     details: { duration, status }, // store extra info in JSON
    },
  });
} catch (err) {
    console.error("Failed to record API metric:", err);
  }
}