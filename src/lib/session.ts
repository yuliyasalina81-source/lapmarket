import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { UserRole } from "@prisma/client";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireSessionUser();
  if (!roles.includes(user.role as UserRole)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireSessionOrRedirect(callbackUrl?: string) {
  const user = await getSessionUser();
  if (!user) {
    const url = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";
    redirect(url);
  }
  return user;
}
