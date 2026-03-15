import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Routes that bypass maintenance mode entirely
const MAINTENANCE_BYPASS = [
  "/maintenance",
  "/staff-login",
  "/api/admin/settings",
  "/api/auth/",
  "/_next/",
  "/favicon",
  "/public/",
];

function isBypass(pathname: string): boolean {
  return MAINTENANCE_BYPASS.some(b => pathname.startsWith(b));
}

// Read maintenance state directly from DB.
// We do NOT use fetch() here — middleware runs in the Edge Runtime and a
// self-referencing fetch() is unreliable in that context, causing the toggle
// to silently always return false (the original bug).
async function maintenanceActive(): Promise<boolean> {
  try {
    const { db } = await import("@/db");
    const { siteSettings } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const rows = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, "maintenance_mode"))
      .limit(1);

    return rows[0]?.value === "true";
  } catch (err) {
    console.error("[middleware] maintenanceActive DB read failed:", err);
    return false; // fail open — never lock out visitors due to a DB error
  }
}

function hasStaffAccess(request: NextRequest): boolean {
  const staffCookie = request.cookies.get("staff-session")?.value;
  const adminCookie = request.cookies.get("admin-session")?.value;
  return staffCookie === "true" || adminCookie === "true";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Maintenance mode gate ────────────────────────────────────────────────
  if (!isBypass(pathname)) {
    const maintenance = await maintenanceActive();
    if (maintenance) {
      if (!hasStaffAccess(request)) {
        const url = request.nextUrl.clone();
        url.pathname = "/maintenance";
        return NextResponse.redirect(url);
      }
      const response = NextResponse.next();
      response.headers.set("x-maintenance-active", "true");
      return response;
    }
  }

  // ── Auth-protected route guard ───────────────────────────────────────────
  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    console.log("[middleware] Session check failed, deferring to page-level auth");
  }

  const isStaffSession = hasStaffAccess(request);
  const isProtectedRoute =
    pathname.startsWith("/convict-portal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff/tools") ||
    pathname.startsWith("/staff/dashboard") ||
    pathname.startsWith("/ldi-waitlist");

  if (!session && isProtectedRoute) {
    if (isStaffSession) return NextResponse.next();
    const url = request.nextUrl.clone();
    const isStaffRoute = pathname.startsWith("/admin") || pathname.startsWith("/staff/");
    url.pathname = isStaffRoute ? "/staff-login" : "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
