// src/lib/metrics.ts
export async function trackApiMetric(
  endpoint: string,
  duration: number,
  status: number,
  userId?: string
) {
  await prisma.apiMetric.create({
    data: {
      endpoint,
      duration,
      status,
      userId,
      timestamp: new Date(),
    },
  });
}

// Usage in API route
const startTime = Date.now();
try {
  // Your API logic
  return response;
} finally {
  const duration = Date.now() - startTime;
  await trackApiMetric("/api/products", duration, 200, user.id);
}