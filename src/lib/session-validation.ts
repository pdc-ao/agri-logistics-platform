// src/lib/session-validation.ts
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "./auth";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to validate user session in API routes
 * @param allowedRoles - Array of roles allowed to access the endpoint
 */
export async function validateSession(
  request: NextRequest,
  allowedRoles?: string[]
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      error: true,
      response: NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      ),
    };
  }

  // Role-based access control
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (session.user as any).role;
    if (!allowedRoles.includes(userRole)) {
      return {
        error: true,
        response: NextResponse.json(
          { error: "Forbidden - Insufficient permissions" },
          { status: 403 }
        ),
      };
    }
  }

  return {
    error: false,
    user: {
      id: (session.user as any).id,
      email: session.user.email!,
      role: (session.user as any).role,
    },
  };
}

/**
 * Higher-order function to wrap API route handlers with session validation
 */
export function withAuth(
  handler: (
    request: NextRequest,
    context: any,
    user: { id: string; email: string; role: string }
  ) => Promise<NextResponse>,
  allowedRoles?: string[]
) {
  return async (request: NextRequest, context: any) => {
    const validation = await validateSession(request, allowedRoles);

    if (validation.error) {
      return validation.response;
    }

    return handler(request, context, validation.user!);
  };
}

/**
 * Validate API key for external integrations
 */
export async function validateApiKey(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return {
      error: true,
      response: NextResponse.json(
        { error: "Missing API key" },
        { status: 401 }
      ),
    };
  }

  // Validate against database or environment variable
  const validApiKey = process.env.API_KEY;
  
  if (apiKey !== validApiKey) {
    return {
      error: true,
      response: NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      ),
    };
  }

  return { error: false };
}