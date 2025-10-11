// src/lib/notifications.ts
import { db } from "@/lib/prisma";

export interface NotificationPayload {
  type: string;
  recipientIds: string[];
  data: Record<string, any>;
  title?: string;
  message?: string;
}

/**
 * Create notifications for one or more recipients.
 * Persists them in the Notification table.
 * You can later extend this to also send email/SMS/push.
 */
export async function sendNotification(payload: NotificationPayload) {
  const { type, recipientIds, data, title, message } = payload;

  if (!recipientIds || recipientIds.length === 0) return;

  const now = new Date();

  // Build records for bulk insert
  const notifications = recipientIds.map((userId) => ({
    userId,
    type,
    title: title ?? type.replace(/_/g, " "), // fallback title
    message:
      message ??
      JSON.stringify(data, null, 2), // fallback: dump data as JSON
    createdAt: now,
    updatedAt: now,
  }));

  await db.notification.createMany({
    data: notifications,
  });

  // Optionally: log or hook into external channels
  console.log(
    `Sent ${notifications.length} notification(s) of type ${type} to users: ${recipientIds.join(
      ", "
    )}`
  );
}
