export type UserRole =
  | 'PRODUCER'
  | 'CONSUMER'
  | 'STORAGE_OWNER'
  | 'TRANSPORTER'
  | 'TRANSFORMER'
  | 'ADMIN';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface BasicUser {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: UserRole;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  averageRating?: number;
  createdAt?: string;
}

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