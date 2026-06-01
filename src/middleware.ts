/**
 * Middleware Next.js: защита маршрутов по JWT-сессии NextAuth.
 * Проверяет роли (ADMIN, SELLER, SPECIALIST) и перенаправляет неавторизованных пользователей.
 */
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Префиксы URL, требующие авторизации. */
const protectedPrefixes = [
  "/profile",
  "/settings",
  "/seller",
  "/listings",
  "/admin",
  "/pets",
  "/onboarding",
];

/** Маршруты, доступные только продавцам. */
const sellerPrefixes = ["/seller"];

/**
 * Возвращает секрет для подписи JWT (AUTH_SECRET или NEXTAUTH_SECRET).
 * @returns Секрет или undefined, если переменные окружения не заданы
 */
function getAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

/**
 * Обрабатывает входящий запрос: проверка токена, роли и редиректы.
 * @param req Входящий запрос Next.js
 * @returns Ответ с редиректом или пропуск дальше по цепочке
 */
export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const secret = getAuthSecret();
  // Без секрета JWT не проверяется — пропускаем запрос
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

  // Админка только для роли ADMIN
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/profile", nextUrl.origin));
  }

  // Раздел продавца только для SELLER
  if (
    sellerPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`)) &&
    role !== "SELLER"
  ) {
    return NextResponse.redirect(new URL("/profile", nextUrl.origin));
  }

  // Защищённые страницы — редирект на логин с callbackUrl
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Уже авторизован на странице входа — редирект в личный кабинет по роли
  if (isAuthPage && isLoggedIn) {
    const target =
      role === "SPECIALIST"
        ? "/dashboard/specialist"
        : role === "ADMIN"
          ? "/admin"
          : "/profile";
    return NextResponse.redirect(new URL(target, nextUrl.origin));
  }

  // Кабинет специалиста — только SPECIALIST или ADMIN
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

/** Маршруты, на которых срабатывает middleware. */
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
