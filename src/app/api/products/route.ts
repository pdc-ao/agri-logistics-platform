import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/session-validation";
import { db } from "@/lib/prisma";
import { createProductSchema, validateRequest } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/rbac-middleware";
import { Prisma } from "@prisma/client";


const productRateLimit = rateLimit({
  windowMs: 60000,
  maxRequests: 10,
});

// POST: Create a new product listing
export const POST = withAuth(async (request: NextRequest, context, user) => {
  try {
    const rateLimitResponse = await productRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const permissionResponse = await requirePermission("product:create")(request);
    if (permissionResponse) return permissionResponse;

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

    // Ensure user is a valid PRODUCER
    const producer = await db.user.findFirst({
      where: {
        id: user.id,
        role: "PRODUCER",
        entityType: "INDIVIDUAL",
      },
    });

    if (!producer) {
      return NextResponse.json({ error: "Unauthorized producer" }, { status: 403 });
    }

    const data = validation.data!;

    // Map request fields → Prisma model fields
    const product = await db.productListing.create({
      data: {
        title: data.name,                       // map → title
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        pricePerUnit: data.price,               // map → pricePerUnit
        quantityAvailable: data.quantity,       // map → quantityAvailable
        unitOfMeasure: data.unit,               // map → unitOfMeasure
        currency: "AOA",                        // default
        locationAddress: data.location,
        imagesUrls: data.images,                // Json? field
        producerId: user.id,
        status: "Active",
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}, ["PRODUCER", "ADMIN"]);

// GET: Fetch product listings with filters and pagination
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const category = searchParams.get("category") || undefined;
    const producerId = searchParams.get("producerId") || undefined;
    const search = searchParams.get("q") || undefined;
    const sort = searchParams.get("sort") || "date_desc";

    let orderBy: Prisma.ProductListingOrderByWithRelationInput;

switch (sort) {
  case "price_asc":
    orderBy = { pricePerUnit: "asc" };
    break;
  case "price_desc":
    orderBy = { pricePerUnit: "desc" };
    break;
  case "qty_desc":
    orderBy = { quantityAvailable: "desc" };
    break;
  case "qty_asc":
    orderBy = { quantityAvailable: "asc" };
    break;
  case "date_asc":
    orderBy = { createdAt: "asc" };
    break;
  default:
    orderBy = { createdAt: "desc" };
}


    const whereClause: any = {
      status: "Active",
      ...(category && { category }),
      ...(producerId && { producerId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      db.productListing.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
        include: {
          producer: {
            select: {
              id: true,
              username: true,
              fullName: true,
              companyName: true,
              entityType: true,
              averageRating: true,
            },
          },
          reviews: {
            select: { id: true, rating: true },
          },
        },
      }),
      db.productListing.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
};
