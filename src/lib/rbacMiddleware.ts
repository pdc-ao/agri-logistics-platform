// src/lib/rbac-middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

type Permission = 
  | "user:read"
  | "user:write"
  | "user:delete"
  | "product:create"
  | "product:update"
  | "product:delete"
  | "order:create"
  | "order:update"
  | "order:cancel"
  | "payment:create"
  | "payment:release"
  | "admin:access"
  | "admin:verify-users"
  | "admin:suspend-users";

const rolePermissions: Record<string, Permission[]> = {
  ADMIN: [
    "user:read",
    "user:write",
    "user:delete",
    "product:create",
    "product:update",
    "product:delete",
    "order:create",
    "order:update",
    "order:cancel",
    "payment:create",
    "payment:release",
    "admin:access",
    "admin:verify-users",
    "admin:suspend-users",
  ],
  PRODUCER: [
    "user:read",
    "user:write",
    "product:create",
    "product:update",
    "product:delete",
    "order:update",
    "payment:release",
  ],
  CONSUMER: [
    "user:read",
    "user:write",
    "order:create",
    "order:cancel",
    "payment:create",
  ],
  TRANSPORTER: [
    "user:read",
    "user:write",
    "order:update",
  ],
  STORAGE_OWNER: [
    "user:read",
    "user:write",
    "order:update",
  ],
};

export function hasPermission(userRole: string, permission: Permission): boolean {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
}

export function requirePermission(...permissions: Permission[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    const hasAllPermissions = permissions.every((permission) =>
      hasPermission(userRole, permission)
    );

    if (!hasAllPermissions) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return null; // Allow request
  };
}

