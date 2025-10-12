// src/types/index.ts
import { z } from "zod";

// -----------------------------------------------------
// Enums (derived from your Prisma schema)
// -----------------------------------------------------

export const UserRole = {
  PRODUCER: "PRODUCER",
  CONSUMER: "CONSUMER",
  STORAGE_OWNER: "STORAGE_OWNER",
  TRANSPORTER: "TRANSPORTER",
  TRANSFORMER: "TRANSFORMER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

// -----------------------------------------------------
// User types
// -----------------------------------------------------

export interface BasicUser {
  id: string;
  username?: string;
  email: string;
  fullName: string | null; // allow both null and undefined via optional
  role?: UserRole;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  averageRating?: number;
  createdAt?: Date;
}

export interface AdminUser extends BasicUser {
  username: string;
  role: UserRole;
  createdAt: Date;
}

// -----------------------------------------------------
// Registration form schema + type
// -----------------------------------------------------

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string(),
  phoneNumber: z.string().optional(),
  role: z.nativeEnum(UserRole),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),

  // Producer-specific fields
  farmName: z.string().optional(),
  farmDescription: z.string().optional(),
  certifications: z.string().optional(),

  // Storage owner-specific fields
  facilityName: z.string().optional(),
  businessRegistrationId: z.string().optional(),

  // Transporter-specific fields
  companyName: z.string().optional(),
  driverLicenseId: z.string().optional(),
  vehicleRegistrationDetails: z.string().optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// -----------------------------------------------------
// Product types
// -----------------------------------------------------

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  quantityAvailable: number;
  unitOfMeasure: string;
  pricePerUnit: number;
  currency: string;
  locationAddress?: string;
  status: string;
  producer: {
    id: string;
    username: string;
    fullName?: string;
    averageRating?: number;
  };
}

export interface PaginatedProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// -----------------------------------------------------
// API error + Document
// -----------------------------------------------------

export interface ApiError {
  error: string;
}

export interface Document {
  id: string;
  userId?: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileKey?: string;
  fileSize?: number;
  mimeType?: string;
  status: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface BusinessDocument {
  id: string;
  userId: string;
  docType: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  submittedAt: Date | string;
  user: {
    fullName: string | null;
    username: string;
  };
}

export interface WalletBalance {
  userId: string;
  available: number;
  pending: number;
  currency: string;
  updatedAt: Date;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: "CREDIT" | "DEBIT";
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: Date;
}