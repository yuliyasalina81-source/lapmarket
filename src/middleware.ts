import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

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

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role as string | undefined;

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
});

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
