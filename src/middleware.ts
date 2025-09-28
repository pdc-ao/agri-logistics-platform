import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: Replace this stub with real session extraction (e.g., using next-auth JWT or middleware token)
async function getUserRoleFromRequest(_req: NextRequest): Promise<string | null> {
  // Example: decode cookie or header
  return null;
}

const protectedRoutes: { pattern: RegExp; allowed: string[] }[] = [
  { pattern: /^\/admin(\/|$)/, allowed: ['ADMIN'] },
  { pattern: /^\/dashboard\/wallet(\/|$)/, allowed: ['ADMIN','PRODUCER','CONSUMER','STORAGE_OWNER','TRANSPORTER','TRANSFORMER'] },
  { pattern: /^\/dashboard\/facilities(\/|$)/, allowed: ['TRANSFORMER','ADMIN'] },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = protectedRoutes.find(r => r.pattern.test(pathname));
  if (!match) return NextResponse.next();

  const role = await getUserRoleFromRequest(req);
  if (!role || !match.allowed.includes(role)) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('unauthorized', '1');
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/wallet/:path*',
    '/dashboard/facilities/:path*',
  ],
};