import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth/verify-token";

/**
 * Next.js Middleware.
 * Intercepts protected page and API routes to validate the httpOnly session token.
 * Performs role-based authorization blocks (analyst/user accounts blocked from admin routes).
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedPath = pathname.startsWith("/admin") || pathname.startsWith("/workspace");
  const isProtectedApi = pathname.startsWith("/api/admin") || pathname.startsWith("/api/chat");

  if (isProtectedPath || isProtectedApi) {
    // 1. Check for token presence
    if (!token) {
      if (isProtectedApi) {
        return NextResponse.json(
          { error: { message: "Access denied. Token missing.", code: "UNAUTHORIZED" } },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // 2. Validate token cryptographically
    const payload = await verifyToken(token);
    if (!payload) {
      if (isProtectedApi) {
        return NextResponse.json(
          { error: { message: "Access denied. Token invalid or expired.", code: "UNAUTHORIZED" } },
          { status: 401 }
        );
      }
      
      // Clear cookie and redirect to auth page
      const response = NextResponse.redirect(new URL("/auth", request.url));
      response.cookies.set("token", "", { maxAge: 0 });
      return response;
    }

    // 3. Role-Based Access Guard
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (payload.role !== "admin") {
        if (isProtectedApi) {
          return NextResponse.json(
            { error: { message: "Forbidden. Admin access required.", code: "FORBIDDEN" } },
            { status: 403 }
          );
        }
        
        // Redirect normal users away from the admin dashboard back to workspace
        return NextResponse.redirect(new URL("/workspace", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/workspace/:path*",
    "/api/admin/:path*",
    "/api/chat/:path*",
  ],
};
