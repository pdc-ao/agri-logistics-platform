// src/lib/rate-limit.ts
import { NextRequest, NextResponse } from "next/server";

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  keyGenerator?: (request: NextRequest) => string;
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs = 60000, // 1 minute default
    maxRequests = 60,
    message = "Too many requests, please try again later",
    keyGenerator = (req) => {
      // Use IP address + user ID (if authenticated) as key
      const ip = req.headers.get("x-forwarded-for") || "unknown";
      return ip;
    },
  } = options;

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = keyGenerator(request);
    const now = Date.now();
    
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      // New window
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return null; // Allow request
    }

    if (record.count >= maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        {
          error: message,
          retryAfter: Math.ceil((record.resetAt - now) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((record.resetAt - now) / 1000).toString(),
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(record.resetAt).toISOString(),
          },
        }
      );
    }

    // Increment counter
    record.count++;
    rateLimitStore.set(key, record);

    return null; // Allow request
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute
