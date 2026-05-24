import type { UserRole } from "@prisma/client";

/** Post-login destination by role. */
export function resolvePostLoginPath(role?: UserRole | string): string {
  if (role === "SPECIALIST") return "/dashboard/specialist";
  if (role === "ADMIN") return "/admin";
  return "/profile";
}
