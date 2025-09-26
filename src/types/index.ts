// Enums from Prisma schema
export enum UserRole {
  PRODUCER = 'PRODUCER',
  CONSUMER = 'CONSUMER',
  STORAGE_OWNER = 'STORAGE_OWNER',
  TRANSPORTER = 'TRANSPORTER',
  TRANSFORMER = 'TRANSFORMER',
  ADMIN = 'ADMIN'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

// Base User interface
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  fullName?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  profilePictureUrl?: string;
  role: UserRole;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationDetails?: string;
  averageRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Role-specific details
export interface ProducerDetails {
  id: string;
  userId: string;
  farmName?: string;
  farmDescription?: string;
  certifications?: string;
  user: User;
}

export interface StorageDetails {
  id: string;
  userId: string;
  facilityName?: string;
  businessRegistrationId?: string;
  user: User;
}

export interface TransporterDetails {
  id: string;
  userId: string;
  companyName?: string;
  driverLicenseId?: string;
  vehicleRegistrationDetails?: string;
  user: User;
}

// Listings
export interface ProductListing {
  id: string;
  producerId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  quantityAvailable: number;
  unitOfMeasure: string;
  pricePerUnit: number;
  currency: string;
  plannedAvailabilityDate?: Date;
  actualAvailabilityDate?: Date;
  locationAddress?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  qualityCertifications?: string;
  imagesUrls?: string[];
  videoUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  producer: User;
  orderItems: OrderItem[];
  reviews: Review[];
}

export interface StorageListing {
  id: string;
  ownerId: string;
  facilityName: string;
  description: string;
  storageType: string;
  totalCapacity?: number;
  capacityUnit?: string;
  availableCapacity?: number;
  amenities?: Record<string, any>;
  pricingStructure: string;
  responsibilities?: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  imagesUrls?: string[];
  availabilityStatus: string;
  createdAt: Date;
  updatedAt: Date;
  owner: User;
  orders: Order[];
  reviews: Review[];
}

export interface TransportListing {
  id: string;
  transporterId: string;
  serviceTitle: string;
  description?: string;
  vehicleType: string;
  carryingCapacityWeight?: number;
  capacityWeightUnit?: string;
  carryingCapacityVolume?: number;
  capacityVolumeUnit?: string;
  operationalRoutes?: string;
  primaryDestinationType?: string;
  pricingModel: string;
  baseLocationCity: string;
  baseLocationCountry: string;
  availabilityStatus: string;
  insuranceDetails?: string;
  imagesUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
  transporter: User;
  orders: Order[];
  reviews: Review[];
}

// Orders and transactions
export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  transporterId?: string;
  storageId?: string;
  orderDate: Date;
  totalAmount: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod?: string;
  transactionId?: string;
  shippingAddressLine1: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  notesForSeller?: string;
  notesForTransporter?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  buyer: User;
  seller: User;
  transporter?: User;
  transportListing?: TransportListing;
  storage?: StorageListing;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productListingId: string;
  quantityOrdered: number;
  pricePerUnitAtOrder: number;
  subtotal: number;
  createdAt: Date;
  order: Order;
  productListing: ProductListing;
}

// New models for verification and payments
export interface BusinessDocument {
  id: string;
  userId: string;
  user: User;
  docType: string;
  fileUrl: string;
  status: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewerId?: string;
  notes?: string;
}

export interface UserRating {
  id: string;
  reviewerId: string;
  reviewer: User;
  reviewedId: string;
  reviewed: User;
  rating: number;
  comment?: string;
  createdAt: Date;
  isModerated: boolean;
}

export interface TransformationFacility {
  id: string;
  ownerId: string;
  owner: User;
  facilityName: string;
  description?: string;
  facilityType?: string;
  capacity?: number;
  capacityUnit?: string;
  addressLine1: string;
  city: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTransaction {
  id: string;
  buyerId: string;
  buyer: User;
  sellerId: string;
  seller: User;
  amount: number;
  currency: string;
  status: string;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  escrowHeldAt?: Date;
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  providerPaymentId?: string;
  providerChargeId?: string;
}

export interface WalletBalance {
  id: string;
  userId: string;
  user: User;
  balance: number;
  updatedAt: Date;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewedEntityId: string;
  reviewedEntityType: string;
  rating: number;
  comment?: string;
  reviewDate: Date;
  isApprovedByAdmin: boolean;
  createdAt: Date;
  reviewer: User;
  reviewedUser?: User;
  reviewedProduct?: ProductListing;
  reviewedStorage?: StorageListing;
  reviewedTransport?: TransportListing;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  messageContent: string;
  sentAt: Date;
  readAt?: Date;
  sender: User;
  receiver: User;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  addressLine1?: string;
  city?: string;
  country: string;
}

export interface ProducerRegistrationData extends RegisterFormData {
  farmName?: string;
  farmDescription?: string;
  certifications?: string;
}

export interface StorageOwnerRegistrationData extends RegisterFormData {
  facilityName?: string;
  businessRegistrationId?: string;
}

export interface TransporterRegistrationData extends RegisterFormData {
  companyName?: string;
  driverLicenseId?: string;
  vehicleRegistrationDetails?: string;
}