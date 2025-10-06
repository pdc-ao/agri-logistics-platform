/*
  Warnings:

  - You are about to drop the column `addressLine1` on the `TransformationFacility` table. All the data in the column will be lost.
  - You are about to drop the column `capacityUnit` on the `TransformationFacility` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `TransformationFacility` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `TransformationFacility` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `TransformationFacility` table. All the data in the column will be lost.
  - You are about to drop the column `facilityName` on the `TransformationFacility` table. All the data in the column will be lost.
  - You are about to drop the column `facilityType` on the `TransformationFacility` table. All the data in the column will be lost.
  - You are about to drop the `BusinessDocument` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[orderNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idempotencyKey]` on the table `PaymentTransaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyName]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `location` to the `TransformationFacility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `TransformationFacility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceType` to the `TransformationFacility` table without a default value. This is not possible if the table is not empty.
  - Made the column `capacity` on table `TransformationFacility` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."EntityType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "public"."DocumentStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."EscrowStatus" AS ENUM ('HELD', 'RELEASED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ProductionStatus" AS ENUM ('PLANNED', 'IN_PREPARATION', 'PLANTED', 'GROWING', 'READY_TO_HARVEST', 'HARVESTING', 'HARVESTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."MilestoneType" AS ENUM ('LAND_PREPARATION', 'PLANTING', 'FERTILIZATION', 'IRRIGATION', 'PEST_CONTROL', 'WEEDING', 'HARVEST_START', 'HARVEST_COMPLETE', 'POST_HARVEST', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."ScheduleStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "public"."UpdateType" AS ENUM ('PROGRESS_UPDATE', 'MILESTONE_REACHED', 'ISSUE_REPORTED', 'QUANTITY_CHANGE', 'DATE_CHANGE', 'WEATHER_IMPACT', 'PEST_DISEASE', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."PreOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."BusinessDocument" DROP CONSTRAINT "BusinessDocument_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "orderNumber" TEXT;

-- AlterTable
ALTER TABLE "public"."PaymentTransaction" ADD COLUMN     "idempotencyKey" TEXT,
ADD COLUMN     "metadata" TEXT,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "public"."TransformationFacility" DROP COLUMN "addressLine1",
DROP COLUMN "capacityUnit",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "description",
DROP COLUMN "facilityName",
DROP COLUMN "facilityType",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "processingRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "serviceType" TEXT NOT NULL,
ALTER COLUMN "capacity" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companyType" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "entityType" "public"."EntityType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN     "incorporationDate" TIMESTAMP(3),
ADD COLUMN     "notificationPreferences" JSONB DEFAULT '{"email":true,"sms":false}',
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "taxId" TEXT;

-- DropTable
DROP TABLE "public"."BusinessDocument";

-- CreateTable
CREATE TABLE "public"."OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "relatedEntityId" TEXT,
    "status" "public"."DocumentStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EscrowTransaction" (
    "id" TEXT NOT NULL,
    "paymentTransactionId" TEXT NOT NULL,
    "milestone" TEXT,
    "status" "public"."EscrowStatus" NOT NULL DEFAULT 'HELD',
    "releaseDate" TIMESTAMP(3),
    "releasedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EscrowTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransactionLedger" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "entryType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentReference" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "operationId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FacilityBooking" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "actualStartDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "inputProduct" TEXT NOT NULL,
    "desiredOutput" TEXT NOT NULL,
    "notes" TEXT,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "totalCost" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AOA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductionPlan" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productCategory" TEXT NOT NULL,
    "variety" TEXT,
    "areaSize" DOUBLE PRECISION NOT NULL,
    "areaUnit" TEXT NOT NULL DEFAULT 'HECTARES',
    "location" TEXT NOT NULL,
    "coordinates" TEXT,
    "estimatedQuantity" DOUBLE PRECISION NOT NULL,
    "quantityUnit" TEXT NOT NULL,
    "estimatedYield" DOUBLE PRECISION,
    "plantingDate" TIMESTAMP(3) NOT NULL,
    "estimatedHarvestDate" TIMESTAMP(3) NOT NULL,
    "actualHarvestDate" TIMESTAMP(3),
    "status" "public"."ProductionStatus" NOT NULL DEFAULT 'PLANNED',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "allowPreOrders" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "farmingMethod" TEXT,
    "certifications" TEXT[],
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductionSchedule" (
    "id" TEXT NOT NULL,
    "productionPlanId" TEXT NOT NULL,
    "milestoneName" TEXT NOT NULL,
    "milestoneType" "public"."MilestoneType" NOT NULL,
    "description" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "status" "public"."ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "notifyBefore" INTEGER NOT NULL DEFAULT 0,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductionUpdate" (
    "id" TEXT NOT NULL,
    "productionPlanId" TEXT NOT NULL,
    "updateType" "public"."UpdateType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "currentGrowthStage" TEXT,
    "healthStatus" TEXT,
    "quantityAdjustment" DOUBLE PRECISION,
    "dateAdjustment" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductionSubscriber" (
    "id" TEXT NOT NULL,
    "productionPlanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notifyOnUpdate" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnMilestone" BOOLEAN NOT NULL DEFAULT true,
    "notify15DaysBefore" BOOLEAN NOT NULL DEFAULT true,
    "notify7DaysBefore" BOOLEAN NOT NULL DEFAULT true,
    "notify1DayBefore" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnHarvest" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PreOrder" (
    "id" TEXT NOT NULL,
    "productionPlanId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "pricePerUnit" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION,
    "status" "public"."PreOrderStatus" NOT NULL DEFAULT 'PENDING',
    "depositAmount" DOUBLE PRECISION,
    "depositPaid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "convertedToOrderId" TEXT,

    CONSTRAINT "PreOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Offering" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OfferingSchedule" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "bookedById" TEXT,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferingSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Component" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "specs" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "stockLevel" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "requestedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Component_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_idx" ON "public"."OrderStatusHistory"("orderId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_changedBy_idx" ON "public"."OrderStatusHistory"("changedBy");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_createdAt_idx" ON "public"."OrderStatusHistory"("createdAt");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "public"."Document"("userId");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "public"."Document"("type");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "public"."Document"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "public"."Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowTransaction_paymentTransactionId_key" ON "public"."EscrowTransaction"("paymentTransactionId");

-- CreateIndex
CREATE INDEX "EscrowTransaction_paymentTransactionId_idx" ON "public"."EscrowTransaction"("paymentTransactionId");

-- CreateIndex
CREATE INDEX "EscrowTransaction_status_idx" ON "public"."EscrowTransaction"("status");

-- CreateIndex
CREATE INDEX "TransactionLedger_transactionId_idx" ON "public"."TransactionLedger"("transactionId");

-- CreateIndex
CREATE INDEX "TransactionLedger_userId_idx" ON "public"."TransactionLedger"("userId");

-- CreateIndex
CREATE INDEX "TransactionLedger_createdAt_idx" ON "public"."TransactionLedger"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentReference_reference_key" ON "public"."PaymentReference"("reference");

-- CreateIndex
CREATE INDEX "PaymentReference_reference_idx" ON "public"."PaymentReference"("reference");

-- CreateIndex
CREATE INDEX "PaymentReference_userId_idx" ON "public"."PaymentReference"("userId");

-- CreateIndex
CREATE INDEX "PaymentReference_status_idx" ON "public"."PaymentReference"("status");

-- CreateIndex
CREATE INDEX "FacilityBooking_facilityId_idx" ON "public"."FacilityBooking"("facilityId");

-- CreateIndex
CREATE INDEX "FacilityBooking_userId_idx" ON "public"."FacilityBooking"("userId");

-- CreateIndex
CREATE INDEX "FacilityBooking_status_idx" ON "public"."FacilityBooking"("status");

-- CreateIndex
CREATE INDEX "FacilityBooking_startDate_endDate_idx" ON "public"."FacilityBooking"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "ProductionPlan_producerId_idx" ON "public"."ProductionPlan"("producerId");

-- CreateIndex
CREATE INDEX "ProductionPlan_status_idx" ON "public"."ProductionPlan"("status");

-- CreateIndex
CREATE INDEX "ProductionPlan_estimatedHarvestDate_idx" ON "public"."ProductionPlan"("estimatedHarvestDate");

-- CreateIndex
CREATE INDEX "ProductionPlan_isPublic_idx" ON "public"."ProductionPlan"("isPublic");

-- CreateIndex
CREATE INDEX "ProductionSchedule_productionPlanId_idx" ON "public"."ProductionSchedule"("productionPlanId");

-- CreateIndex
CREATE INDEX "ProductionSchedule_scheduledDate_idx" ON "public"."ProductionSchedule"("scheduledDate");

-- CreateIndex
CREATE INDEX "ProductionSchedule_status_idx" ON "public"."ProductionSchedule"("status");

-- CreateIndex
CREATE INDEX "ProductionUpdate_productionPlanId_idx" ON "public"."ProductionUpdate"("productionPlanId");

-- CreateIndex
CREATE INDEX "ProductionUpdate_createdAt_idx" ON "public"."ProductionUpdate"("createdAt");

-- CreateIndex
CREATE INDEX "ProductionSubscriber_userId_idx" ON "public"."ProductionSubscriber"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionSubscriber_productionPlanId_userId_key" ON "public"."ProductionSubscriber"("productionPlanId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PreOrder_convertedToOrderId_key" ON "public"."PreOrder"("convertedToOrderId");

-- CreateIndex
CREATE INDEX "PreOrder_productionPlanId_idx" ON "public"."PreOrder"("productionPlanId");

-- CreateIndex
CREATE INDEX "PreOrder_customerId_idx" ON "public"."PreOrder"("customerId");

-- CreateIndex
CREATE INDEX "PreOrder_status_idx" ON "public"."PreOrder"("status");

-- CreateIndex
CREATE INDEX "Offering_ownerId_idx" ON "public"."Offering"("ownerId");

-- CreateIndex
CREATE INDEX "OfferingSchedule_offeringId_idx" ON "public"."OfferingSchedule"("offeringId");

-- CreateIndex
CREATE INDEX "OfferingSchedule_startTime_endTime_idx" ON "public"."OfferingSchedule"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "OfferingSchedule_bookedById_idx" ON "public"."OfferingSchedule"("bookedById");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "public"."AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Component_supplierId_idx" ON "public"."Component"("supplierId");

-- CreateIndex
CREATE INDEX "Component_category_idx" ON "public"."Component"("category");

-- CreateIndex
CREATE INDEX "Component_requestedBy_idx" ON "public"."Component"("requestedBy");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "public"."Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_receiverId_idx" ON "public"."Message"("senderId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "public"."Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_buyerId_sellerId_orderStatus_idx" ON "public"."Order"("buyerId", "sellerId", "orderStatus");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "public"."Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "public"."Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "public"."OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productListingId_idx" ON "public"."OrderItem"("productListingId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_idempotencyKey_key" ON "public"."PaymentTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentTransaction_buyerId_idx" ON "public"."PaymentTransaction"("buyerId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_sellerId_idx" ON "public"."PaymentTransaction"("sellerId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "public"."PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_idempotencyKey_idx" ON "public"."PaymentTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentTransaction_createdAt_idx" ON "public"."PaymentTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "ProductListing_status_category_idx" ON "public"."ProductListing"("status", "category");

-- CreateIndex
CREATE INDEX "ProductListing_producerId_idx" ON "public"."ProductListing"("producerId");

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "public"."Review"("reviewerId");

-- CreateIndex
CREATE INDEX "Review_reviewedEntityId_reviewedEntityType_idx" ON "public"."Review"("reviewedEntityId", "reviewedEntityType");

-- CreateIndex
CREATE INDEX "StorageListing_ownerId_city_idx" ON "public"."StorageListing"("ownerId", "city");

-- CreateIndex
CREATE INDEX "StorageListing_availabilityStatus_idx" ON "public"."StorageListing"("availabilityStatus");

-- CreateIndex
CREATE INDEX "TransformationFacility_ownerId_idx" ON "public"."TransformationFacility"("ownerId");

-- CreateIndex
CREATE INDEX "TransformationFacility_isActive_idx" ON "public"."TransformationFacility"("isActive");

-- CreateIndex
CREATE INDEX "TransportListing_transporterId_baseLocationCity_idx" ON "public"."TransportListing"("transporterId", "baseLocationCity");

-- CreateIndex
CREATE INDEX "TransportListing_availabilityStatus_idx" ON "public"."TransportListing"("availabilityStatus");

-- CreateIndex
CREATE UNIQUE INDEX "User_companyName_key" ON "public"."User"("companyName");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "User_isVerified_idx" ON "public"."User"("isVerified");

-- CreateIndex
CREATE INDEX "User_entityType_idx" ON "public"."User"("entityType");

-- CreateIndex
CREATE INDEX "UserRating_reviewerId_reviewedId_idx" ON "public"."UserRating"("reviewerId", "reviewedId");

-- CreateIndex
CREATE INDEX "WalletBalance_userId_idx" ON "public"."WalletBalance"("userId");

-- AddForeignKey
ALTER TABLE "public"."OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EscrowTransaction" ADD CONSTRAINT "EscrowTransaction_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "public"."PaymentTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransactionLedger" ADD CONSTRAINT "TransactionLedger_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."PaymentTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransactionLedger" ADD CONSTRAINT "TransactionLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentReference" ADD CONSTRAINT "PaymentReference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FacilityBooking" ADD CONSTRAINT "FacilityBooking_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "public"."TransformationFacility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FacilityBooking" ADD CONSTRAINT "FacilityBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductionPlan" ADD CONSTRAINT "ProductionPlan_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductionSchedule" ADD CONSTRAINT "ProductionSchedule_productionPlanId_fkey" FOREIGN KEY ("productionPlanId") REFERENCES "public"."ProductionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductionUpdate" ADD CONSTRAINT "ProductionUpdate_productionPlanId_fkey" FOREIGN KEY ("productionPlanId") REFERENCES "public"."ProductionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductionUpdate" ADD CONSTRAINT "ProductionUpdate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductionSubscriber" ADD CONSTRAINT "ProductionSubscriber_productionPlanId_fkey" FOREIGN KEY ("productionPlanId") REFERENCES "public"."ProductionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductionSubscriber" ADD CONSTRAINT "ProductionSubscriber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PreOrder" ADD CONSTRAINT "PreOrder_productionPlanId_fkey" FOREIGN KEY ("productionPlanId") REFERENCES "public"."ProductionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PreOrder" ADD CONSTRAINT "PreOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PreOrder" ADD CONSTRAINT "PreOrder_convertedToOrderId_fkey" FOREIGN KEY ("convertedToOrderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Offering" ADD CONSTRAINT "Offering_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OfferingSchedule" ADD CONSTRAINT "OfferingSchedule_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "public"."Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OfferingSchedule" ADD CONSTRAINT "OfferingSchedule_bookedById_fkey" FOREIGN KEY ("bookedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Component" ADD CONSTRAINT "Component_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Component" ADD CONSTRAINT "Component_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
