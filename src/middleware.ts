import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/db/supabase/middleware";

const PROTECTED_PREFIXES = [
  "/student",
  "/institution",
  "/super-admin",
] as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // This page is intentionally URL-only. The marker is set only by middleware
  // so the protected layout can render the sign-in screen without exposing the
  // platform console itself.
  if (pathname === "/super-admin/login") {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-manoyug-super-admin-login", "1");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  if (request.headers.has("x-manoyug-super-admin-login")) {
    return NextResponse.redirect(new URL("/super-admin/login", request.url));
  }

  const response = await updateSession(request);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return response;
  }

  // Full RBAC + membership checks happen in server layouts/actions.
  // When Supabase is unconfigured (local scaffold), allow shell routes for UI work.
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!configured) {
    return response;
  }

  const hasSession = request.cookies
    .getAll()
    .some(
      (c) =>
        c.name.includes("auth-token") ||
        c.name.includes("sb-") ||
        c.name === "manoyug_inst_id" ||
        c.name === "manoyug_inst_code" ||
        c.name === "manoyug_role" ||
        c.name === "manoyug_student_session",
    );

  if (!hasSession) {
    const login = new URL(pathname.startsWith("/super-admin") ? "/super-admin/login" : "/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
