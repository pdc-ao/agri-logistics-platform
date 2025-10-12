--
-- PostgreSQL database dump
--

-- Dumped from database version 15.14 (Debian 15.14-1.pgdg13+1)
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: BookingStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BookingStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."BookingStatus" OWNER TO postgres;

--
-- Name: DocumentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DocumentStatus" AS ENUM (
    'PENDING_REVIEW',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."DocumentStatus" OWNER TO postgres;

--
-- Name: EntityType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EntityType" AS ENUM (
    'INDIVIDUAL',
    'COMPANY'
);


ALTER TYPE public."EntityType" OWNER TO postgres;

--
-- Name: EscrowStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EscrowStatus" AS ENUM (
    'HELD',
    'RELEASED',
    'CANCELLED'
);


ALTER TYPE public."EscrowStatus" OWNER TO postgres;

--
-- Name: MilestoneType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MilestoneType" AS ENUM (
    'LAND_PREPARATION',
    'PLANTING',
    'FERTILIZATION',
    'IRRIGATION',
    'PEST_CONTROL',
    'WEEDING',
    'HARVEST_START',
    'HARVEST_COMPLETE',
    'POST_HARVEST',
    'CUSTOM'
);


ALTER TYPE public."MilestoneType" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: PreOrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PreOrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."PreOrderStatus" OWNER TO postgres;

--
-- Name: ProductionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProductionStatus" AS ENUM (
    'PLANNED',
    'IN_PREPARATION',
    'PLANTED',
    'GROWING',
    'READY_TO_HARVEST',
    'HARVESTING',
    'HARVESTED',
    'CANCELLED'
);


ALTER TYPE public."ProductionStatus" OWNER TO postgres;

--
-- Name: ScheduleStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ScheduleStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'DELAYED',
    'SKIPPED'
);


ALTER TYPE public."ScheduleStatus" OWNER TO postgres;

--
-- Name: UpdateType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UpdateType" AS ENUM (
    'PROGRESS_UPDATE',
    'MILESTONE_REACHED',
    'ISSUE_REPORTED',
    'QUANTITY_CHANGE',
    'DATE_CHANGE',
    'WEATHER_IMPACT',
    'PEST_DISEASE',
    'GENERAL'
);


ALTER TYPE public."UpdateType" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'PRODUCER',
    'CONSUMER',
    'STORAGE_OWNER',
    'TRANSPORTER',
    'ADMIN',
    'TRANSFORMER'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public."VerificationStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    details jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: Component; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Component" (
    id text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    specs text NOT NULL,
    "supplierId" text NOT NULL,
    "stockLevel" integer NOT NULL,
    "unitPrice" double precision NOT NULL,
    "requestedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Component" OWNER TO postgres;

--
-- Name: Document; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Document" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    "fileName" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileKey" text,
    "fileSize" integer,
    "mimeType" text,
    "relatedEntityId" text,
    status public."DocumentStatus" DEFAULT 'PENDING_REVIEW'::public."DocumentStatus" NOT NULL,
    "rejectionReason" text,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Document" OWNER TO postgres;

--
-- Name: EscrowTransaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EscrowTransaction" (
    id text NOT NULL,
    "paymentTransactionId" text NOT NULL,
    milestone text,
    status public."EscrowStatus" DEFAULT 'HELD'::public."EscrowStatus" NOT NULL,
    "releaseDate" timestamp(3) without time zone,
    "releasedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."EscrowTransaction" OWNER TO postgres;

--
-- Name: FacilityBooking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FacilityBooking" (
    id text NOT NULL,
    "facilityId" text NOT NULL,
    "userId" text NOT NULL,
    "serviceType" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "actualStartDate" timestamp(3) without time zone,
    "actualEndDate" timestamp(3) without time zone,
    quantity double precision DEFAULT 0 NOT NULL,
    "inputProduct" text NOT NULL,
    "desiredOutput" text NOT NULL,
    notes text,
    status public."BookingStatus" DEFAULT 'PENDING'::public."BookingStatus" NOT NULL,
    "totalCost" double precision NOT NULL,
    currency text DEFAULT 'AOA'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FacilityBooking" OWNER TO postgres;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "senderId" text NOT NULL,
    "receiverId" text NOT NULL,
    "messageContent" text NOT NULL,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "readAt" timestamp(3) without time zone
);


ALTER TABLE public."Message" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Offering; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Offering" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "ownerId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Offering" OWNER TO postgres;

--
-- Name: OfferingSchedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OfferingSchedule" (
    id text NOT NULL,
    "offeringId" text NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "bookedById" text,
    status public."BookingStatus" DEFAULT 'PENDING'::public."BookingStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."OfferingSchedule" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "buyerId" text NOT NULL,
    "sellerId" text NOT NULL,
    "transporterId" text,
    "storageId" text,
    "orderDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "totalAmount" double precision NOT NULL,
    currency text DEFAULT 'AOA'::text NOT NULL,
    "orderStatus" text NOT NULL,
    "paymentStatus" text NOT NULL,
    "paymentMethod" text,
    "transactionId" text,
    "shippingAddressLine1" text NOT NULL,
    "shippingCity" text NOT NULL,
    "shippingPostalCode" text NOT NULL,
    "shippingCountry" text DEFAULT 'Angola'::text NOT NULL,
    "notesForSeller" text,
    "notesForTransporter" text,
    "estimatedDeliveryDate" timestamp(3) without time zone,
    "actualDeliveryDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "orderNumber" text
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productListingId" text NOT NULL,
    "quantityOrdered" double precision NOT NULL,
    "pricePerUnitAtOrder" double precision NOT NULL,
    subtotal double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: OrderStatusHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderStatusHistory" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    status text NOT NULL,
    notes text,
    "changedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderStatusHistory" OWNER TO postgres;

--
-- Name: PaymentReference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PaymentReference" (
    id text NOT NULL,
    reference text NOT NULL,
    "userId" text NOT NULL,
    "operationId" text,
    amount double precision NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "confirmedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PaymentReference" OWNER TO postgres;

--
-- Name: PaymentTransaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PaymentTransaction" (
    id text NOT NULL,
    "buyerId" text NOT NULL,
    "sellerId" text NOT NULL,
    amount numeric(18,2) NOT NULL,
    currency text DEFAULT 'AOA'::text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "buyerConfirmed" boolean DEFAULT false NOT NULL,
    "sellerConfirmed" boolean DEFAULT false NOT NULL,
    "escrowHeldAt" timestamp(3) without time zone,
    "releasedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "providerPaymentId" text,
    "providerChargeId" text,
    "idempotencyKey" text,
    metadata text,
    type text
);


ALTER TABLE public."PaymentTransaction" OWNER TO postgres;

--
-- Name: PreOrder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PreOrder" (
    id text NOT NULL,
    "productionPlanId" text NOT NULL,
    "customerId" text NOT NULL,
    quantity double precision NOT NULL,
    "pricePerUnit" double precision,
    "totalPrice" double precision,
    status public."PreOrderStatus" DEFAULT 'PENDING'::public."PreOrderStatus" NOT NULL,
    "depositAmount" double precision,
    "depositPaid" boolean DEFAULT false NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "convertedToOrderId" text
);


ALTER TABLE public."PreOrder" OWNER TO postgres;

--
-- Name: ProducerDetails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProducerDetails" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "farmName" text,
    "farmDescription" text,
    certifications text
);


ALTER TABLE public."ProducerDetails" OWNER TO postgres;

--
-- Name: ProductListing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductListing" (
    id text NOT NULL,
    "producerId" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    subcategory text,
    "quantityAvailable" double precision NOT NULL,
    "unitOfMeasure" text NOT NULL,
    "pricePerUnit" double precision NOT NULL,
    currency text DEFAULT 'AOA'::text NOT NULL,
    "plannedAvailabilityDate" timestamp(3) without time zone,
    "actualAvailabilityDate" timestamp(3) without time zone,
    "locationAddress" text,
    "locationLatitude" double precision,
    "locationLongitude" double precision,
    "qualityCertifications" text,
    "imagesUrls" jsonb,
    "videoUrl" text,
    status text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductListing" OWNER TO postgres;

--
-- Name: ProductionPlan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductionPlan" (
    id text NOT NULL,
    "producerId" text NOT NULL,
    "productName" text NOT NULL,
    "productCategory" text NOT NULL,
    variety text,
    "areaSize" double precision NOT NULL,
    "areaUnit" text DEFAULT 'HECTARES'::text NOT NULL,
    location text NOT NULL,
    coordinates text,
    "estimatedQuantity" double precision NOT NULL,
    "quantityUnit" text NOT NULL,
    "estimatedYield" double precision,
    "plantingDate" timestamp(3) without time zone NOT NULL,
    "estimatedHarvestDate" timestamp(3) without time zone NOT NULL,
    "actualHarvestDate" timestamp(3) without time zone,
    status public."ProductionStatus" DEFAULT 'PLANNED'::public."ProductionStatus" NOT NULL,
    "isPublic" boolean DEFAULT true NOT NULL,
    "allowPreOrders" boolean DEFAULT false NOT NULL,
    description text,
    "farmingMethod" text,
    certifications text[],
    images text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductionPlan" OWNER TO postgres;

--
-- Name: ProductionSchedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductionSchedule" (
    id text NOT NULL,
    "productionPlanId" text NOT NULL,
    "milestoneName" text NOT NULL,
    "milestoneType" public."MilestoneType" NOT NULL,
    description text,
    "scheduledDate" timestamp(3) without time zone NOT NULL,
    "completedDate" timestamp(3) without time zone,
    status public."ScheduleStatus" DEFAULT 'PENDING'::public."ScheduleStatus" NOT NULL,
    "notifyBefore" integer DEFAULT 0 NOT NULL,
    "notificationSent" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductionSchedule" OWNER TO postgres;

--
-- Name: ProductionSubscriber; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductionSubscriber" (
    id text NOT NULL,
    "productionPlanId" text NOT NULL,
    "userId" text NOT NULL,
    "notifyOnUpdate" boolean DEFAULT true NOT NULL,
    "notifyOnMilestone" boolean DEFAULT true NOT NULL,
    "notify15DaysBefore" boolean DEFAULT true NOT NULL,
    "notify7DaysBefore" boolean DEFAULT true NOT NULL,
    "notify1DayBefore" boolean DEFAULT true NOT NULL,
    "notifyOnHarvest" boolean DEFAULT true NOT NULL,
    "subscribedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProductionSubscriber" OWNER TO postgres;

--
-- Name: ProductionUpdate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductionUpdate" (
    id text NOT NULL,
    "productionPlanId" text NOT NULL,
    "updateType" public."UpdateType" NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    images text[],
    "currentGrowthStage" text,
    "healthStatus" text,
    "quantityAdjustment" double precision,
    "dateAdjustment" timestamp(3) without time zone,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProductionUpdate" OWNER TO postgres;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "reviewerId" text NOT NULL,
    "reviewedEntityId" text NOT NULL,
    "reviewedEntityType" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    "reviewDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isApprovedByAdmin" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Review" OWNER TO postgres;

--
-- Name: StorageDetails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorageDetails" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "facilityName" text,
    "businessRegistrationId" text
);


ALTER TABLE public."StorageDetails" OWNER TO postgres;

--
-- Name: StorageListing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorageListing" (
    id text NOT NULL,
    "ownerId" text NOT NULL,
    "facilityName" text NOT NULL,
    description text NOT NULL,
    "storageType" text NOT NULL,
    "totalCapacity" double precision,
    "capacityUnit" text,
    "availableCapacity" double precision,
    amenities jsonb,
    "pricingStructure" text NOT NULL,
    responsibilities text,
    "addressLine1" text NOT NULL,
    city text NOT NULL,
    "postalCode" text NOT NULL,
    country text DEFAULT 'Angola'::text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    "imagesUrls" jsonb,
    "availabilityStatus" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StorageListing" OWNER TO postgres;

--
-- Name: Supplier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Supplier" (
    id text NOT NULL,
    name text NOT NULL,
    contact text NOT NULL,
    location text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Supplier" OWNER TO postgres;

--
-- Name: TransactionLedger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TransactionLedger" (
    id text NOT NULL,
    "transactionId" text NOT NULL,
    "userId" text NOT NULL,
    "accountType" text NOT NULL,
    "entryType" text NOT NULL,
    amount double precision NOT NULL,
    balance double precision NOT NULL,
    description text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TransactionLedger" OWNER TO postgres;

--
-- Name: TransformationFacility; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TransformationFacility" (
    id text NOT NULL,
    "ownerId" text NOT NULL,
    capacity double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    location text NOT NULL,
    name text NOT NULL,
    "processingRate" double precision DEFAULT 0 NOT NULL,
    "serviceType" text NOT NULL
);


ALTER TABLE public."TransformationFacility" OWNER TO postgres;

--
-- Name: TransportListing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TransportListing" (
    id text NOT NULL,
    "transporterId" text NOT NULL,
    "serviceTitle" text NOT NULL,
    description text,
    "vehicleType" text NOT NULL,
    "carryingCapacityWeight" double precision,
    "capacityWeightUnit" text,
    "carryingCapacityVolume" double precision,
    "capacityVolumeUnit" text,
    "operationalRoutes" text,
    "primaryDestinationType" text,
    "pricingModel" text NOT NULL,
    "baseLocationCity" text NOT NULL,
    "baseLocationCountry" text DEFAULT 'Angola'::text NOT NULL,
    "availabilityStatus" text NOT NULL,
    "insuranceDetails" text,
    "imagesUrls" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TransportListing" OWNER TO postgres;

--
-- Name: TransporterDetails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TransporterDetails" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "companyName" text,
    "driverLicenseId" text,
    "vehicleRegistrationDetails" text
);


ALTER TABLE public."TransporterDetails" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "fullName" text,
    "phoneNumber" text,
    "addressLine1" text,
    "addressLine2" text,
    city text,
    "stateProvince" text,
    "postalCode" text,
    country text DEFAULT 'Angola'::text NOT NULL,
    latitude double precision,
    longitude double precision,
    "profilePictureUrl" text,
    role public."UserRole" NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "verificationDetails" text,
    "averageRating" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "verificationStatus" public."VerificationStatus" DEFAULT 'PENDING'::public."VerificationStatus" NOT NULL,
    "companyName" text,
    "companyType" text,
    "dateOfBirth" timestamp(3) without time zone,
    "entityType" public."EntityType" DEFAULT 'INDIVIDUAL'::public."EntityType" NOT NULL,
    "incorporationDate" timestamp(3) without time zone,
    "notificationPreferences" jsonb DEFAULT '{"sms": false, "email": true}'::jsonb,
    "registrationNumber" text,
    "taxId" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserRating; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserRating" (
    id text NOT NULL,
    "reviewerId" text NOT NULL,
    "reviewedId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isModerated" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."UserRating" OWNER TO postgres;

--
-- Name: WalletBalance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WalletBalance" (
    id text NOT NULL,
    "userId" text NOT NULL,
    balance numeric(18,2) DEFAULT 0 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WalletBalance" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, "userId", action, "entityType", "entityId", details, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: Component; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Component" (id, name, category, specs, "supplierId", "stockLevel", "unitPrice", "requestedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Document" (id, "userId", type, "fileName", "fileUrl", "fileKey", "fileSize", "mimeType", "relatedEntityId", status, "rejectionReason", "reviewedBy", "reviewedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: EscrowTransaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EscrowTransaction" (id, "paymentTransactionId", milestone, status, "releaseDate", "releasedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: FacilityBooking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FacilityBooking" (id, "facilityId", "userId", "serviceType", "startDate", "endDate", "actualStartDate", "actualEndDate", quantity, "inputProduct", "desiredOutput", notes, status, "totalCost", currency, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Message" (id, "conversationId", "senderId", "receiverId", "messageContent", "sentAt", "readAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "userId", type, title, message, read, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Offering; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Offering" (id, title, description, "ownerId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OfferingSchedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OfferingSchedule" (id, "offeringId", "startTime", "endTime", "bookedById", status, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "buyerId", "sellerId", "transporterId", "storageId", "orderDate", "totalAmount", currency, "orderStatus", "paymentStatus", "paymentMethod", "transactionId", "shippingAddressLine1", "shippingCity", "shippingPostalCode", "shippingCountry", "notesForSeller", "notesForTransporter", "estimatedDeliveryDate", "actualDeliveryDate", "createdAt", "updatedAt", "orderNumber") FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "productListingId", "quantityOrdered", "pricePerUnitAtOrder", subtotal, "createdAt") FROM stdin;
\.


--
-- Data for Name: OrderStatusHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderStatusHistory" (id, "orderId", status, notes, "changedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: PaymentReference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PaymentReference" (id, reference, "userId", "operationId", amount, status, "confirmedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PaymentTransaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PaymentTransaction" (id, "buyerId", "sellerId", amount, currency, status, "buyerConfirmed", "sellerConfirmed", "escrowHeldAt", "releasedAt", "createdAt", "updatedAt", "providerPaymentId", "providerChargeId", "idempotencyKey", metadata, type) FROM stdin;
\.


--
-- Data for Name: PreOrder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PreOrder" (id, "productionPlanId", "customerId", quantity, "pricePerUnit", "totalPrice", status, "depositAmount", "depositPaid", notes, "createdAt", "updatedAt", "convertedToOrderId") FROM stdin;
\.


--
-- Data for Name: ProducerDetails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProducerDetails" (id, "userId", "farmName", "farmDescription", certifications) FROM stdin;
\.


--
-- Data for Name: ProductListing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductListing" (id, "producerId", title, description, category, subcategory, "quantityAvailable", "unitOfMeasure", "pricePerUnit", currency, "plannedAvailabilityDate", "actualAvailabilityDate", "locationAddress", "locationLatitude", "locationLongitude", "qualityCertifications", "imagesUrls", "videoUrl", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProductionPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductionPlan" (id, "producerId", "productName", "productCategory", variety, "areaSize", "areaUnit", location, coordinates, "estimatedQuantity", "quantityUnit", "estimatedYield", "plantingDate", "estimatedHarvestDate", "actualHarvestDate", status, "isPublic", "allowPreOrders", description, "farmingMethod", certifications, images, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProductionSchedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductionSchedule" (id, "productionPlanId", "milestoneName", "milestoneType", description, "scheduledDate", "completedDate", status, "notifyBefore", "notificationSent", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProductionSubscriber; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductionSubscriber" (id, "productionPlanId", "userId", "notifyOnUpdate", "notifyOnMilestone", "notify15DaysBefore", "notify7DaysBefore", "notify1DayBefore", "notifyOnHarvest", "subscribedAt") FROM stdin;
\.


--
-- Data for Name: ProductionUpdate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductionUpdate" (id, "productionPlanId", "updateType", title, description, images, "currentGrowthStage", "healthStatus", "quantityAdjustment", "dateAdjustment", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Review" (id, "reviewerId", "reviewedEntityId", "reviewedEntityType", rating, comment, "reviewDate", "isApprovedByAdmin", "createdAt") FROM stdin;
\.


--
-- Data for Name: StorageDetails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorageDetails" (id, "userId", "facilityName", "businessRegistrationId") FROM stdin;
\.


--
-- Data for Name: StorageListing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorageListing" (id, "ownerId", "facilityName", description, "storageType", "totalCapacity", "capacityUnit", "availableCapacity", amenities, "pricingStructure", responsibilities, "addressLine1", city, "postalCode", country, latitude, longitude, "imagesUrls", "availabilityStatus", "createdAt", "updatedAt") FROM stdin;
bcb4c5a3-8bdc-4aa4-8bd2-3c3270b4563d	1bf5de53-c6ec-41c4-9fba-b00133bd7073	Test Warehouse	Test	Armazém Seco	1000	\N	1000	\N	por tonelada	\N	Rua Teste 1	Luanda	0000	Angola	-8.8	13.2	\N	Available	2025-09-25 20:01:23.161	2025-09-25 20:01:23.161
\.


--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Supplier" (id, name, contact, location, "createdAt") FROM stdin;
\.


--
-- Data for Name: TransactionLedger; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TransactionLedger" (id, "transactionId", "userId", "accountType", "entryType", amount, balance, description, "createdAt") FROM stdin;
\.


--
-- Data for Name: TransformationFacility; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TransformationFacility" (id, "ownerId", capacity, "createdAt", "updatedAt", "isActive", location, name, "processingRate", "serviceType") FROM stdin;
\.


--
-- Data for Name: TransportListing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TransportListing" (id, "transporterId", "serviceTitle", description, "vehicleType", "carryingCapacityWeight", "capacityWeightUnit", "carryingCapacityVolume", "capacityVolumeUnit", "operationalRoutes", "primaryDestinationType", "pricingModel", "baseLocationCity", "baseLocationCountry", "availabilityStatus", "insuranceDetails", "imagesUrls", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TransporterDetails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TransporterDetails" (id, "userId", "companyName", "driverLicenseId", "vehicleRegistrationDetails") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, username, email, "passwordHash", "fullName", "phoneNumber", "addressLine1", "addressLine2", city, "stateProvince", "postalCode", country, latitude, longitude, "profilePictureUrl", role, "isVerified", "verificationDetails", "averageRating", "createdAt", "updatedAt", "verificationStatus", "companyName", "companyType", "dateOfBirth", "entityType", "incorporationDate", "notificationPreferences", "registrationNumber", "taxId") FROM stdin;
939b0c28-24d2-4e9d-a142-5fb24886a8e5	testuser	test@example.com	secret	\N	\N	\N	\N	\N	\N	\N	Angola	\N	\N	\N	PRODUCER	f	\N	\N	2025-09-25 19:44:03.136	2025-09-25 19:44:03.136	PENDING	\N	\N	\N	INDIVIDUAL	\N	{"sms": false, "email": true}	\N	\N
1bf5de53-c6ec-41c4-9fba-b00133bd7073	storageowner1	owner@example.com	secret	\N	\N	\N	\N	\N	\N	\N	Angola	\N	\N	\N	STORAGE_OWNER	f	\N	\N	2025-09-25 19:57:54.385	2025-09-25 19:57:54.385	PENDING	\N	\N	\N	INDIVIDUAL	\N	{"sms": false, "email": true}	\N	\N
6f22ed53-6296-45ee-a986-3d976cd7b5ea	raulteste4	raul.fm.mateus4@gmail.com	$2b$12$JHADngpw.avMItQNOYVGyO3DSf5Ae207sBBaxCFh1hPudQp76Y/uC	raul mateus4	940741684	\N	\N	\N	\N	\N	Angola	\N	\N	\N	PRODUCER	f	\N	\N	2025-10-07 12:57:28.635	2025-10-07 12:57:28.635	PENDING	\N	\N	\N	INDIVIDUAL	\N	{"sms": false, "email": true}	\N	\N
\.


--
-- Data for Name: UserRating; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserRating" (id, "reviewerId", "reviewedId", rating, comment, "createdAt", "isModerated") FROM stdin;
\.


--
-- Data for Name: WalletBalance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WalletBalance" (id, "userId", balance, "updatedAt") FROM stdin;
bf8ef0b7-f59a-45dc-8d35-f5489d8f5320	6f22ed53-6296-45ee-a986-3d976cd7b5ea	0.00	2025-10-07 12:57:28.641
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
bad9acda-a5d0-43e6-9a56-63720277276d	475deb140ff95ede377a80cbad7b69bd99908308a1e58ac160362b3cf9e5bd98	2025-09-23 15:11:37.695648+00	20250923151137_init	\N	\N	2025-09-23 15:11:37.642909+00	1
5be300f0-3d08-4e2e-8dea-43e37cd134a3	28837e74913db1e63d17e8c6576300c4e2fac4503daf15c5d434ffe1f1055fbe	2025-09-25 21:11:33.749485+00	20250925211133_add_verification_and_escrow	\N	\N	2025-09-25 21:11:33.713922+00	1
bae574d4-0209-4dc4-9e47-642b1a922578	ca318f33bd0f56adddcead9bed9e7787a614e2be907b7efa648a1405f17a2469	2025-10-05 20:25:57.93982+00	20251005202557_fix_escrow_relation	\N	\N	2025-10-05 20:25:57.748953+00	1
\.


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Component Component_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Component"
    ADD CONSTRAINT "Component_pkey" PRIMARY KEY (id);


--
-- Name: Document Document_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);


--
-- Name: EscrowTransaction EscrowTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EscrowTransaction"
    ADD CONSTRAINT "EscrowTransaction_pkey" PRIMARY KEY (id);


--
-- Name: FacilityBooking FacilityBooking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FacilityBooking"
    ADD CONSTRAINT "FacilityBooking_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OfferingSchedule OfferingSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OfferingSchedule"
    ADD CONSTRAINT "OfferingSchedule_pkey" PRIMARY KEY (id);


--
-- Name: Offering Offering_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Offering"
    ADD CONSTRAINT "Offering_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: OrderStatusHistory OrderStatusHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PaymentReference PaymentReference_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentReference"
    ADD CONSTRAINT "PaymentReference_pkey" PRIMARY KEY (id);


--
-- Name: PaymentTransaction PaymentTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentTransaction"
    ADD CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY (id);


--
-- Name: PreOrder PreOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PreOrder"
    ADD CONSTRAINT "PreOrder_pkey" PRIMARY KEY (id);


--
-- Name: ProducerDetails ProducerDetails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProducerDetails"
    ADD CONSTRAINT "ProducerDetails_pkey" PRIMARY KEY (id);


--
-- Name: ProductListing ProductListing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductListing"
    ADD CONSTRAINT "ProductListing_pkey" PRIMARY KEY (id);


--
-- Name: ProductionPlan ProductionPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductionPlan"
    ADD CONSTRAINT "ProductionPlan_pkey" PRIMARY KEY (id);


--
-- Name: ProductionSchedule ProductionSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductionSchedule"
    ADD CONSTRAINT "ProductionSchedule_pkey" PRIMARY KEY (id);


--
-- Name: ProductionSubscriber ProductionSubscriber_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductionSubscriber"
    ADD CONSTRAINT "ProductionSubscriber_pkey" PRIMARY KEY (id);


--
-- Name: ProductionUpdate ProductionUpdate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductionUpdate"
    ADD CONSTRAINT "ProductionUpdate_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: StorageDetails StorageDetails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageDetails"
    ADD CONSTRAINT "StorageDetails_pkey" PRIMARY KEY (id);


--
-- Name: StorageListing StorageListing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageListing"
    ADD CONSTRAINT "StorageListing_pkey" PRIMARY KEY (id);


--
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id);


--
-- Name: TransactionLedger TransactionLedger_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionLedger"
    ADD CONSTRAINT "TransactionLedger_pkey" PRIMARY KEY (id);


--
-- Name: TransformationFacility TransformationFacility_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransformationFacility"
    ADD CONSTRAINT "TransformationFacility_pkey" PRIMARY KEY (id);


--
-- Name: TransportListing TransportListing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransportListing"
    ADD CONSTRAINT "TransportListing_pkey" PRIMARY KEY (id);


--
-- Name: TransporterDetails TransporterDetails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransporterDetails"
    ADD CONSTRAINT "TransporterDetails_pkey" PRIMARY KEY (id);


--
-- Name: UserRating UserRating_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRating"
    ADD CONSTRAINT "UserRating_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WalletBalance WalletBalance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletBalance"
    ADD CONSTRAINT "WalletBalance_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AuditLog_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_action_idx" ON public."AuditLog" USING btree (action);


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_entityType_entityId_idx" ON public."AuditLog" USING btree ("entityType", "entityId");


--
-- Name: AuditLog_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_userId_idx" ON public."AuditLog" USING btree ("userId");


--
-- Name: Component_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Component_category_idx" ON public."Component" USING btree (category);


--
-- Name: Component_requestedBy_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Component_requestedBy_idx" ON public."Component" USING btree ("requestedBy");


--
-- Name: Component_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Component_supplierId_idx" ON public."Component" USING btree ("supplierId");


--
-- Name: Document_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Document_status_idx" ON public."Document" USING btree (status);


--
-- Name: Document_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Document_type_idx" ON public."Document" USING btree (type);


--
-- Name: Document_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Document_userId_idx" ON public."Document" USING btree ("userId");


--
-- Name: EscrowTransaction_paymentTransactionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EscrowTransaction_paymentTransactionId_idx" ON public."EscrowTransaction" USING btree ("paymentTransactionId");


--
-- Name: EscrowTransaction_paymentTransactionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EscrowTransaction_paymentTransactionId_key" ON public."EscrowTransaction" USING btree ("paymentTransactionId");


--
-- Name: EscrowTransaction_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EscrowTransaction_status_idx" ON public."EscrowTransaction" USING btree (status);


--
-- Name: FacilityBooking_facilityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FacilityBooking_facilityId_idx" ON public."FacilityBooking" USING btree ("facilityId");


--
-- Name: FacilityBooking_startDate_endDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FacilityBooking_startDate_endDate_idx" ON public."FacilityBooking" USING btree ("startDate", "endDate");


--
-- Name: FacilityBooking_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FacilityBooking_status_idx" ON public."FacilityBooking" USING btree (status);


--
-- Name: FacilityBooking_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FacilityBooking_userId_idx" ON public."FacilityBooking" USING btree ("userId");


--
-- Name: Message_conversationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Message_conversationId_idx" ON public."Message" USING btree ("conversationId");


--
-- Name: Message_senderId_receiverId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Message_senderId_receiverId_idx" ON public."Message" USING btree ("senderId", "receiverId");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_userId_read_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_userId_read_idx" ON public."Notification" USING btree ("userId", read);


--
-- Name: OfferingSchedule_bookedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OfferingSchedule_bookedById_idx" ON public."OfferingSchedule" USING btree ("bookedById");


--
-- Name: OfferingSchedule_offeringId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OfferingSchedule_offeringId_idx" ON public."OfferingSchedule" USING btree ("offeringId");


--
-- Name: OfferingSchedule_startTime_endTime_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OfferingSchedule_startTime_endTime_idx" ON public."OfferingSchedule" USING btree ("startTime", "endTime");


--
-- Name: Offering_ownerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Offering_ownerId_idx" ON public."Offering" USING btree ("ownerId");


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_productListingId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_productListingId_idx" ON public."OrderItem" USING btree ("productListingId");


--
-- Name: OrderStatusHistory_changedBy_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderStatusHistory_changedBy_idx" ON public."OrderStatusHistory" USING btree ("changedBy");


--
-- Name: OrderStatusHistory_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderStatusHistory_createdAt_idx" ON public."OrderStatusHistory" USING btree ("createdAt");


--
-- Name: OrderStatusHistory_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderStatusHistory_orderId_idx" ON public."OrderStatusHistory" USING btree ("orderId");


--
-- Name: Order_buyerId_sellerId_orderStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_buyerId_sellerId_orderStatus_idx" ON public."Order" USING btree ("buyerId", "sellerId", "orderStatus");


--
-- Name: Order_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_createdAt_idx" ON public."Order" USING btree ("createdAt");


--
-- Name: Order_orderNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_orderNumber_idx" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: PaymentReference_reference_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentReference_reference_idx" ON public."PaymentReference" USING btree (reference);


--
-- Name: PaymentReference_reference_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PaymentReference_reference_key" ON public."PaymentReference" USING btree (reference);


--
-- Name: PaymentReference_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentReference_status_idx" ON public."PaymentReference" USING btree (status);


--
-- Name: PaymentReference_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentReference_userId_idx" ON public."PaymentReference" USING btree ("userId");


--
-- Name: PaymentTransaction_buyerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentTransaction_buyerId_idx" ON public."PaymentTransaction" USING btree ("buyerId");


--
-- Name: PaymentTransaction_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentTransaction_createdAt_idx" ON public."PaymentTransaction" USING btree ("createdAt");


--
-- Name: PaymentTransaction_idempotencyKey_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentTransaction_idempotencyKey_idx" ON public."PaymentTransaction" USING btree ("idempotencyKey");


--
-- Name: PaymentTransaction_idempotencyKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PaymentTransaction_idempotencyKey_key" ON public."PaymentTransaction" USING btree ("idempotencyKey");


--
-- Name: PaymentTransaction_sellerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentTransaction_sellerId_idx" ON public."PaymentTransaction" USING btree ("sellerId");


--
-- Name: PaymentTransaction_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentTransaction_status_idx" ON public."PaymentTransaction" USING btree (status);


--
-- Name: PreOrder_convertedToOrderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PreOrder_convertedToOrderId_key" ON public."PreOrder" USING btree ("convertedToOrderId");


--
-- Name: PreOrder_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PreOrder_customerId_idx" ON public."PreOrder" USING btree ("customerId");


--
-- Name: PreOrder_productionPlanId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PreOrder_productionPlanId_idx" ON public."PreOrder" USING btree ("productionPlanId");


--
-- Name: PreOrder_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PreOrder_status_idx" ON public."PreOrder" USING btree (status);


--
-- Name: ProducerDetails_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProducerDetails_userId_key" ON public."ProducerDetails" USING btree ("userId");


--
-- Name: ProductListing_producerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductListing_producerId_idx" ON public."ProductListing" USING btree ("producerId");


--
-- Name: ProductListing_status_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductListing_status_category_idx" ON public."ProductListing" USING btree (status, category);


--
-- Name: ProductionPlan_estimatedHarvestDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductionPlan_estimatedHarvestDate_idx" ON public."ProductionPlan" USING btree ("estimatedHarvestDate");


--
-- Name: ProductionPlan_isPublic_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductionPlan_isPublic_idx" ON public."ProductionPlan" USING btree ("isPublic");


--
-- Name: ProductionPlan_producerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductionPlan_producerId_idx" ON public."ProductionPlan" USING btree ("producerId");


--
-- Name: ProductionPlan_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductionPlan_status_idx" ON public."ProductionPlan" USING btree (status);


--
-- Name: ProductionSchedule_productionPlanId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductionSchedule_productionPlanId_idx" ON public."ProductionSchedule" USING btree ("productionPlanId");


--
-- Name: ProductionSchedule_scheduledDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductionSchedule_scheduledDate_idx" ON public."ProductionSchedule" USING btree ("scheduledDate");


--
-- Name: ProductionSchedule_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductionSchedule_status_idx" ON public."ProductionSchedule" USING btree (status);


--
-- Name: ProductionSubscriber_productionPlanId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductionSubscriber_productionPlanId_userId_key" ON public."ProductionSubscriber" USING btree ("productionPlanId", "userId");


--
-- Name: ProductionSubscriber_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductionSubscriber_userId_idx" ON public."ProductionSubscriber" USING btree ("userId");


--
-- Name: ProductionUpdate_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductionUpdate_createdAt_idx" ON public."ProductionUpdate" USING btree ("createdAt");


--
-- Name: ProductionUpdate_productionPlanId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductionUpdate_productionPlanId_idx" ON public."ProductionUpdate" USING btree ("productionPlanId");


--
-- Name: Review_reviewedEntityId_reviewedEntityType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Review_reviewedEntityId_reviewedEntityType_idx" ON public."Review" USING btree ("reviewedEntityId", "reviewedEntityType");


--
-- Name: Review_reviewerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Review_reviewerId_idx" ON public."Review" USING btree ("reviewerId");


--
-- Name: StorageDetails_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StorageDetails_userId_key" ON public."StorageDetails" USING btree ("userId");


--
-- Name: StorageListing_availabilityStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StorageListing_availabilityStatus_idx" ON public."StorageListing" USING btree ("availabilityStatus");


--
-- Name: StorageListing_ownerId_city_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StorageListing_ownerId_city_idx" ON public."StorageListing" USING btree ("ownerId", city);


--
-- Name: TransactionLedger_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TransactionLedger_createdAt_idx" ON public."TransactionLedger" USING btree ("createdAt");


--
-- Name: TransactionLedger_transactionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TransactionLedger_transactionId_idx" ON public."TransactionLedger" USING btree ("transactionId");


--
-- Name: TransactionLedger_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TransactionLedger_userId_idx" ON public."TransactionLedger" USING btree ("userId");


--
-- Name: TransformationFacility_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TransformationFacility_isActive_idx" ON public."TransformationFacility" USING btree ("isActive");


--
-- Name: TransformationFacility_ownerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TransformationFacility_ownerId_idx" ON public."TransformationFacility" USING btree ("ownerId");


--
-- Name: TransportListing_availabilityStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TransportListing_availabilityStatus_idx" ON public."TransportListing" USING btree ("availabilityStatus");


--
-- Name: TransportListing_transporterId_baseLocationCity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TransportListing_transporterId_baseLocationCity_idx" ON public."TransportListing" USING btree ("transporterId", "baseLocationCity");


--
-- Name: TransporterDetails_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TransporterDetails_userId_key" ON public."TransporterDetails" USING btree ("userId");


--
-- Name: UserRating_reviewerId_reviewedId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "UserRating_reviewerId_reviewedId_idx" ON public."UserRating" USING btree ("reviewerId", "reviewedId");


--
-- Name: User_companyName_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_companyName_key" ON public."User" USING btree ("companyName");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_entityType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_entityType_idx" ON public."User" USING btree ("entityType");


--
-- Name: User_isVerified_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_isVerified_idx" ON public."User" USING btree ("isVerified");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: WalletBalance_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WalletBalance_userId_idx" ON public."WalletBalance" USING btree ("userId");


--
-- Name: WalletBalance_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WalletBalance_userId_key" ON public."WalletBalance" USING btree ("userId");


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Component Component_requestedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Component"
    ADD CONSTRAINT "Component_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Component Component_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Component"
    ADD CONSTRAINT "Component_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Document Document_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EscrowTransaction EscrowTransaction_paymentTransactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EscrowTransaction"
    ADD CONSTRAINT "EscrowTransaction_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES public."PaymentTransaction"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FacilityBooking FacilityBooking_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FacilityBooking"
    ADD CONSTRAINT "FacilityBooking_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."TransformationFacility"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FacilityBooking FacilityBooking_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FacilityBooking"
    ADD CONSTRAINT "FacilityBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OfferingSchedule OfferingSchedule_bookedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OfferingSchedule"
    ADD CONSTRAINT "OfferingSchedule_bookedById_fkey" FOREIGN KEY ("bookedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OfferingSchedule OfferingSchedule_offeringId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OfferingSchedule"
    ADD CONSTRAINT "OfferingSchedule_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES public."Offering"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Offering Offering_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Offering"
    ADD CONSTRAINT "Offering_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productListingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productListingId_fkey" FOREIGN KEY ("productListingId") REFERENCES public."ProductListing"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderStatusHistory OrderStatusHistory_changedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderStatusHistory OrderStatusHistory_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_storageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES public."StorageListing"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PaymentReference PaymentReference_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentReference"
    ADD CONSTRAINT "PaymentReference_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PaymentTransaction PaymentTransaction_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentTransaction"
    ADD CONSTRAINT "PaymentTransaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PaymentTransaction PaymentTransaction_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentTransaction"
    ADD CONSTRAINT "PaymentTransaction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PreOrder PreOrder_convertedToOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PreOrder"
    ADD CONSTRAINT "PreOrder_convertedToOrderId_fkey" FOREIGN KEY ("convertedToOrderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PreOrder PreOrder_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PreOrder"
    ADD CONSTRAINT "PreOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PreOrder PreOrder_productionPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PreOrder"
    ADD CONSTRAINT "PreOrder_productionPlanId_fkey" FOREIGN KEY ("productionPlanId") REFERENCES public."ProductionPlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProducerDetails ProducerDetails_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProducerDetails"
    ADD CONSTRAINT "ProducerDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductListing ProductListing_producerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductListing"
    ADD CONSTRAINT "ProductListing_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductionPlan ProductionPlan_producerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductionPlan"
    ADD CONSTRAINT "ProductionPlan_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductionSchedule ProductionSchedule_productionPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductionSchedule"
    ADD CONSTRAINT "ProductionSchedule_productionPlanId_fkey" FOREIGN KEY ("productionPlanId") REFERENCES public."ProductionPlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductionSubscriber ProductionSubscriber_productionPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductionSubscriber"
    ADD CONSTRAINT "ProductionSubscriber_productionPlanId_fkey" FOREIGN KEY ("productionPlanId") REFERENCES public."ProductionPlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductionSubscriber ProductionSubscriber_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductionSubscriber"
    ADD CONSTRAINT "ProductionSubscriber_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductionUpdate ProductionUpdate_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductionUpdate"
    ADD CONSTRAINT "ProductionUpdate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductionUpdate ProductionUpdate_productionPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductionUpdate"
    ADD CONSTRAINT "ProductionUpdate_productionPlanId_fkey" FOREIGN KEY ("productionPlanId") REFERENCES public."ProductionPlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StorageDetails StorageDetails_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageDetails"
    ADD CONSTRAINT "StorageDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StorageListing StorageListing_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorageListing"
    ADD CONSTRAINT "StorageListing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransactionLedger TransactionLedger_transactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionLedger"
    ADD CONSTRAINT "TransactionLedger_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES public."PaymentTransaction"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TransactionLedger TransactionLedger_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransactionLedger"
    ADD CONSTRAINT "TransactionLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransformationFacility TransformationFacility_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransformationFacility"
    ADD CONSTRAINT "TransformationFacility_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransportListing TransportListing_transporterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransportListing"
    ADD CONSTRAINT "TransportListing_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransporterDetails TransporterDetails_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TransporterDetails"
    ADD CONSTRAINT "TransporterDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRating UserRating_reviewedId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRating"
    ADD CONSTRAINT "UserRating_reviewedId_fkey" FOREIGN KEY ("reviewedId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserRating UserRating_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRating"
    ADD CONSTRAINT "UserRating_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WalletBalance WalletBalance_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletBalance"
    ADD CONSTRAINT "WalletBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order fk_order_transporter_listing; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT fk_order_transporter_listing FOREIGN KEY ("transporterId") REFERENCES public."TransportListing"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order fk_order_transporter_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT fk_order_transporter_user FOREIGN KEY ("transporterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Review fk_review_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT fk_review_product FOREIGN KEY ("reviewedEntityId") REFERENCES public."ProductListing"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review fk_review_storage; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT fk_review_storage FOREIGN KEY ("reviewedEntityId") REFERENCES public."StorageListing"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review fk_review_transport; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT fk_review_transport FOREIGN KEY ("reviewedEntityId") REFERENCES public."TransportListing"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review fk_review_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT fk_review_user FOREIGN KEY ("reviewedEntityId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

