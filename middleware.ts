import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const MAINTENANCE_BYPASS = [
  "/maintenance",
  "/api/admin/settings",
  "/staff-login",
  "/admin/",
  "/staff/",
  "/_next/",
  "/api/auth/",
  "/favicon",
];

function isBypass(p: string) {
  return MAINTENANCE_BYPASS.some(b => p.startsWith(b));
}

async function maintenanceActive(): Promise<boolean> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/admin/settings`, { next: { revalidate: 30 } });
    if (!res.ok) return false;
    const data = await res.json();
    return data.maintenance_mode === "true";
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isBypass(pathname)) {
    const maintenance = await maintenanceActive();
    if (maintenance) {
      const staffCookie  = request.cookies.get("staff-session")?.value;
      const adminCookie  = request.cookies.get("admin-session")?.value;
      const isStaff = staffCookie === "true" || adminCookie === "true";

      if (!isStaff) {
        const url = request.nextUrl.clone();
        url.pathname = "/maintenance";
        return NextResponse.redirect(url);
      }
      const response = NextResponse.next();
      response.headers.set("x-maintenance-active", "true");
      return response;
    }
  }

  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    console.log("Middleware: Session check failed, allowing page-level auth");
  }

  const staffCookie = request.cookies.get("staff-session")?.value;
  const adminCookie = request.cookies.get("admin-session")?.value;
  const isStaffSession = staffCookie === "true";
  const isAdminSession = adminCookie === "true";

  if (!session && (
    pathname.startsWith("/convict-portal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff/tools") ||
    pathname.startsWith("/staff/dashboard") ||
    pathname.startsWith("/ldi-waitlist")
  )) {
    if (isStaffSession || isAdminSession) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/admin") || pathname.startsWith("/staff/") ? "/staff-login" : "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
