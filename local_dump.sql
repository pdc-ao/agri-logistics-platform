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
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, username, email, "passwordHash", "fullName", "phoneNumber", "addressLine1", "addressLine2", city, "stateProvince", "postalCode", country, latitude, longitude, "profilePictureUrl", role, "isVerified", "verificationDetails", "averageRating", "createdAt", "updatedAt", "verificationStatus", "companyName", "companyType", "dateOfBirth", "entityType", "incorporationDate", "notificationPreferences", "registrationNumber", "taxId") FROM stdin;
939b0c28-24d2-4e9d-a142-5fb24886a8e5	testuser	test@example.com	secret	\N	\N	\N	\N	\N	\N	\N	Angola	\N	\N	\N	PRODUCER	f	\N	\N	2025-09-25 19:44:03.136	2025-09-25 19:44:03.136	PENDING	\N	\N	\N	INDIVIDUAL	\N	{"sms": false, "email": true}	\N	\N
1bf5de53-c6ec-41c4-9fba-b00133bd7073	storageowner1	owner@example.com	secret	\N	\N	\N	\N	\N	\N	\N	Angola	\N	\N	\N	STORAGE_OWNER	f	\N	\N	2025-09-25 19:57:54.385	2025-09-25 19:57:54.385	PENDING	\N	\N	\N	INDIVIDUAL	\N	{"sms": false, "email": true}	\N	\N
6f22ed53-6296-45ee-a986-3d976cd7b5ea	raulteste4	raul.fm.mateus4@gmail.com	$2b$12$JHADngpw.avMItQNOYVGyO3DSf5Ae207sBBaxCFh1hPudQp76Y/uC	raul mateus4	940741684	\N	\N	\N	\N	\N	Angola	\N	\N	\N	PRODUCER	f	\N	\N	2025-10-07 12:57:28.635	2025-10-07 12:57:28.635	PENDING	\N	\N	\N	INDIVIDUAL	\N	{"sms": false, "email": true}	\N	\N
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "userId", action, "entityType", "entityId", details, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Supplier" (id, name, contact, location, "createdAt") FROM stdin;
\.


--
-- Data for Name: Component; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Component" (id, name, category, specs, "supplierId", "stockLevel", "unitPrice", "requestedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Document" (id, "userId", type, "fileName", "fileUrl", "fileKey", "fileSize", "mimeType", "relatedEntityId", status, "rejectionReason", "reviewedBy", "reviewedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PaymentTransaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PaymentTransaction" (id, "buyerId", "sellerId", amount, currency, status, "buyerConfirmed", "sellerConfirmed", "escrowHeldAt", "releasedAt", "createdAt", "updatedAt", "providerPaymentId", "providerChargeId", "idempotencyKey", metadata, type) FROM stdin;
\.


--
-- Data for Name: EscrowTransaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EscrowTransaction" (id, "paymentTransactionId", milestone, status, "releaseDate", "releasedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: TransformationFacility; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TransformationFacility" (id, "ownerId", capacity, "createdAt", "updatedAt", "isActive", location, name, "processingRate", "serviceType") FROM stdin;
\.


--
-- Data for Name: FacilityBooking; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FacilityBooking" (id, "facilityId", "userId", "serviceType", "startDate", "endDate", "actualStartDate", "actualEndDate", quantity, "inputProduct", "desiredOutput", notes, status, "totalCost", currency, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Message" (id, "conversationId", "senderId", "receiverId", "messageContent", "sentAt", "readAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, "userId", type, title, message, read, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Offering; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Offering" (id, title, description, "ownerId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OfferingSchedule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OfferingSchedule" (id, "offeringId", "startTime", "endTime", "bookedById", status, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StorageListing; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StorageListing" (id, "ownerId", "facilityName", description, "storageType", "totalCapacity", "capacityUnit", "availableCapacity", amenities, "pricingStructure", responsibilities, "addressLine1", city, "postalCode", country, latitude, longitude, "imagesUrls", "availabilityStatus", "createdAt", "updatedAt") FROM stdin;
bcb4c5a3-8bdc-4aa4-8bd2-3c3270b4563d	1bf5de53-c6ec-41c4-9fba-b00133bd7073	Test Warehouse	Test	Armazém Seco	1000	\N	1000	\N	por tonelada	\N	Rua Teste 1	Luanda	0000	Angola	-8.8	13.2	\N	Available	2025-09-25 20:01:23.161	2025-09-25 20:01:23.161
\.


--
-- Data for Name: TransportListing; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TransportListing" (id, "transporterId", "serviceTitle", description, "vehicleType", "carryingCapacityWeight", "capacityWeightUnit", "carryingCapacityVolume", "capacityVolumeUnit", "operationalRoutes", "primaryDestinationType", "pricingModel", "baseLocationCity", "baseLocationCountry", "availabilityStatus", "insuranceDetails", "imagesUrls", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Order" (id, "buyerId", "sellerId", "transporterId", "storageId", "orderDate", "totalAmount", currency, "orderStatus", "paymentStatus", "paymentMethod", "transactionId", "shippingAddressLine1", "shippingCity", "shippingPostalCode", "shippingCountry", "notesForSeller", "notesForTransporter", "estimatedDeliveryDate", "actualDeliveryDate", "createdAt", "updatedAt", "orderNumber") FROM stdin;
\.


--
-- Data for Name: ProductListing; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductListing" (id, "producerId", title, description, category, subcategory, "quantityAvailable", "unitOfMeasure", "pricePerUnit", currency, "plannedAvailabilityDate", "actualAvailabilityDate", "locationAddress", "locationLatitude", "locationLongitude", "qualityCertifications", "imagesUrls", "videoUrl", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderItem" (id, "orderId", "productListingId", "quantityOrdered", "pricePerUnitAtOrder", subtotal, "createdAt") FROM stdin;
\.


--
-- Data for Name: OrderStatusHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderStatusHistory" (id, "orderId", status, notes, "changedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: PaymentReference; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PaymentReference" (id, reference, "userId", "operationId", amount, status, "confirmedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProductionPlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductionPlan" (id, "producerId", "productName", "productCategory", variety, "areaSize", "areaUnit", location, coordinates, "estimatedQuantity", "quantityUnit", "estimatedYield", "plantingDate", "estimatedHarvestDate", "actualHarvestDate", status, "isPublic", "allowPreOrders", description, "farmingMethod", certifications, images, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PreOrder; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PreOrder" (id, "productionPlanId", "customerId", quantity, "pricePerUnit", "totalPrice", status, "depositAmount", "depositPaid", notes, "createdAt", "updatedAt", "convertedToOrderId") FROM stdin;
\.


--
-- Data for Name: ProducerDetails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProducerDetails" (id, "userId", "farmName", "farmDescription", certifications) FROM stdin;
\.


--
-- Data for Name: ProductionSchedule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductionSchedule" (id, "productionPlanId", "milestoneName", "milestoneType", description, "scheduledDate", "completedDate", status, "notifyBefore", "notificationSent", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProductionSubscriber; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductionSubscriber" (id, "productionPlanId", "userId", "notifyOnUpdate", "notifyOnMilestone", "notify15DaysBefore", "notify7DaysBefore", "notify1DayBefore", "notifyOnHarvest", "subscribedAt") FROM stdin;
\.


--
-- Data for Name: ProductionUpdate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductionUpdate" (id, "productionPlanId", "updateType", title, description, images, "currentGrowthStage", "healthStatus", "quantityAdjustment", "dateAdjustment", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Review" (id, "reviewerId", "reviewedEntityId", "reviewedEntityType", rating, comment, "reviewDate", "isApprovedByAdmin", "createdAt") FROM stdin;
\.


--
-- Data for Name: StorageDetails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StorageDetails" (id, "userId", "facilityName", "businessRegistrationId") FROM stdin;
\.


--
-- Data for Name: TransactionLedger; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TransactionLedger" (id, "transactionId", "userId", "accountType", "entryType", amount, balance, description, "createdAt") FROM stdin;
\.


--
-- Data for Name: TransporterDetails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TransporterDetails" (id, "userId", "companyName", "driverLicenseId", "vehicleRegistrationDetails") FROM stdin;
\.


--
-- Data for Name: UserRating; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserRating" (id, "reviewerId", "reviewedId", rating, comment, "createdAt", "isModerated") FROM stdin;
\.


--
-- Data for Name: WalletBalance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WalletBalance" (id, "userId", balance, "updatedAt") FROM stdin;
bf8ef0b7-f59a-45dc-8d35-f5489d8f5320	6f22ed53-6296-45ee-a986-3d976cd7b5ea	0.00	2025-10-07 12:57:28.641
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
bad9acda-a5d0-43e6-9a56-63720277276d	475deb140ff95ede377a80cbad7b69bd99908308a1e58ac160362b3cf9e5bd98	2025-09-23 15:11:37.695648+00	20250923151137_init	\N	\N	2025-09-23 15:11:37.642909+00	1
5be300f0-3d08-4e2e-8dea-43e37cd134a3	28837e74913db1e63d17e8c6576300c4e2fac4503daf15c5d434ffe1f1055fbe	2025-09-25 21:11:33.749485+00	20250925211133_add_verification_and_escrow	\N	\N	2025-09-25 21:11:33.713922+00	1
bae574d4-0209-4dc4-9e47-642b1a922578	ca318f33bd0f56adddcead9bed9e7787a614e2be907b7efa648a1405f17a2469	2025-10-05 20:25:57.93982+00	20251005202557_fix_escrow_relation	\N	\N	2025-10-05 20:25:57.748953+00	1
\.


--
-- PostgreSQL database dump complete
--

