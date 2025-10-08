// src/lib/validation.ts
import { z } from "zod";

// User schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  role: z.enum(["PRODUCER", "CONSUMER", "TRANSPORTER", "STORAGE_OWNER"]),
  businessName: z.string().min(2).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password required"),
});

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["GRAINS", "VEGETABLES", "FRUITS", "LIVESTOCK", "DAIRY"]),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.enum(["KG", "TON", "LITER", "PIECE"]),
  location: z.string().min(2),
  images: z.array(z.string().url()).max(5, "Maximum 5 images allowed"),
});

// Order schemas
export const createOrderSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().positive(),
  deliveryAddress: z.string().min(5),
  deliveryDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "IN_TRANSIT",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
  ]),
  notes: z.string().max(500).optional(),
});

// Payment schemas
export const createPaymentSchema = z.object({
  orderId: z.string().cuid(),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["WALLET", "BANK_TRANSFER", "MOBILE_MONEY"]),
  metadata: z.record(z.any()).optional(),
});

// Booking schemas
export const createBookingSchema = z.object({
  facilityId: z.string().cuid(),
  serviceType: z.string().min(2),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  quantity: z.number().positive().optional(),
  inputProduct: z.string().min(2),
  desiredOutput: z.string().min(2),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

// Admin schemas
export const updateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(["PRODUCER", "CONSUMER", "TRANSPORTER", "STORAGE_OWNER", "ADMIN"]),
});

export const verificationReviewSchema = z.object({
  documentId: z.string().cuid(),
  status: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().min(5).optional(),
});

// Validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/*
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

// src/lib/rbac-middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

type Permission = 
  | "user:read"
  | "user:write"
  | "user:delete"
  | "product:create"
  | "product:update"
  | "product:delete"
  | "order:create"
  | "order:update"
  | "order:cancel"
  | "payment:create"
  | "payment:release"
  | "admin:access"
  | "admin:verify-users"
  | "admin:suspend-users";

const rolePermissions: Record<string, Permission[]> = {
  ADMIN: [
    "user:read",
    "user:write",
    "user:delete",
    "product:create",
    "product:update",
    "product:delete",
    "order:create",
    "order:update",
    "order:cancel",
    "payment:create",
    "payment:release",
    "admin:access",
    "admin:verify-users",
    "admin:suspend-users",
  ],
  PRODUCER: [
    "user:read",
    "user:write",
    "product:create",
    "product:update",
    "product:delete",
    "order:update",
    "payment:release",
  ],
  CONSUMER: [
    "user:read",
    "user:write",
    "order:create",
    "order:cancel",
    "payment:create",
  ],
  TRANSPORTER: [
    "user:read",
    "user:write",
    "order:update",
  ],
  STORAGE_OWNER: [
    "user:read",
    "user:write",
    "order:update",
  ],
};

export function hasPermission(userRole: string, permission: Permission): boolean {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
}

export function requirePermission(...permissions: Permission[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    const hasAllPermissions = permissions.every((permission) =>
      hasPermission(userRole, permission)
    );

    if (!hasAllPermissions) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return null; // Allow request
  };
}

// Example: Protected API route with validation and rate limiting
// src/app/api/products/route.ts (Updated)
/*
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/session-validation";
import { prisma } from "@/lib/prisma";
import { createProductSchema, validateRequest } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/rbac-middleware";

const productRateLimit = rateLimit({
  windowMs: 60000, // 1 minute
  maxRequests: 10, // 10 products per minute
});

export const POST = withAuth(async (request: NextRequest, context, user) => {
  try {
    // Apply rate limiting
    const rateLimitResponse = await productRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Check permissions
    const permissionResponse = await requirePermission("product:create")(request);
    if (permissionResponse) return permissionResponse;

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequest(createProductSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors?.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        ...validation.data!,
        producerId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}, ["PRODUCER", "ADMIN"]);

// GET with pagination and filtering
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          producer: {
            select: {
              id: true,
              email: true,
              businessName: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
};*/