import type { UserRole } from "@prisma/client";

/** Post-login destination by role. */
export function resolvePostLoginPath(role?: UserRole | string): string {
  if (role === "SPECIALIST") return "/dashboard/specialist";
  if (role === "ADMIN") return "/admin";
  return "/profile";
}

/** Profile tab / avatar: profile when signed in, login with return URL otherwise. */
export function profileNavHref(authenticated: boolean): string {
  if (!authenticated) return "/login?callbackUrl=/profile";
  return "/profile";
}
