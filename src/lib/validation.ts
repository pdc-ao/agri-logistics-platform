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
  name: z.string().min(2),
  description: z.string().min(2),
  category: z.enum(["GRAINS", "VEGETABLES", "FRUITS", "LIVESTOCK", "DAIRY"]),
  subcategory: z.string().optional(), // ✅ this is the fix
  price: z.number().positive(),
  quantity: z.number().positive(),
  unit: z.enum(["KG", "TON", "LITER", "PIECE"]),
  location: z.string().min(2),
  images: z.array(z.string()).default([]),
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
  metadata: z.record(z.string(), z.any()).optional(),
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
};