//api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/session-validation";
import { db } from "@/lib/prisma";
import { createProductSchema, validateRequest } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/rbac-middleware";

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
    const producer = await prisma.user.findFirst({
      where: {
        id: user.id,
        role: "PRODUCER",
        entityType: "INDIVIDUAL",
      },
    });

    if (!producer) {
      return NextResponse.json({ error: "Unauthorized producer" }, { status: 403 });
    }

    const product = await prisma.productListing.create({
      data: {
        ...validation.data!,
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

    const orderBy =
      sort === "price_asc" ? { pricePerUnit: "asc" } :
      sort === "price_desc" ? { pricePerUnit: "desc" } :
      sort === "qty_desc" ? { quantityAvailable: "desc" } :
      sort === "qty_asc" ? { quantityAvailable: "asc" } :
      sort === "date_asc" ? { createdAt: "asc" } :
      { createdAt: "desc" };

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
      prisma.productListing.findMany({
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
      prisma.productListing.count({ where: whereClause }),
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
