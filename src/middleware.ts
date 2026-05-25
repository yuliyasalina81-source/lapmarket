import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/profile",
  "/settings",
  "/seller",
  "/listings",
  "/admin",
  "/pets",
  "/onboarding",
];

const sellerPrefixes = ["/seller"];

function getAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const secret = getAuthSecret();
  if (!secret) {
    return NextResponse.next();
  }

  const secureCookie = nextUrl.protocol === "https:";
  const token = await getToken({
    req,
    secret,
    secureCookie,
  });

  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

  const isProtected = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/profile", nextUrl.origin));
  }

  if (
    sellerPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`)) &&
    role !== "SELLER"
  ) {
    return NextResponse.redirect(new URL("/profile", nextUrl.origin));
  }

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isLoggedIn) {
    const target =
      role === "SPECIALIST"
        ? "/dashboard/specialist"
        : role === "ADMIN"
          ? "/admin"
          : "/profile";
    return NextResponse.redirect(new URL(target, nextUrl.origin));
  }

  if (
    pathname.startsWith("/dashboard/specialist") &&
    isLoggedIn &&
    role !== "SPECIALIST" &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/profile", nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile",
    "/profile/:path*",
    "/dashboard/:path*",
    "/settings",
    "/seller/:path*",
    "/listings/:path*",
    "/admin/:path*",
    "/pets/:path*",
    "/onboarding",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
