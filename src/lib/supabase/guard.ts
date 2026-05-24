import { auth } from "@/lib/auth";
import type { UserRole } from "@prisma/client";

export async function requireAuthUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}

export async function requireAdminUser() {
  const user = await requireAuthUser();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireSpecialistUser() {
  const user = await requireAuthUser();
  if (user.role !== "SPECIALIST" && user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export function mapPrismaRoleToProfileRole(
  role: UserRole
): "client" | "specialist" | "admin" {
  if (role === "ADMIN") return "admin";
  if (role === "SPECIALIST") return "specialist";
  return "client";
}
