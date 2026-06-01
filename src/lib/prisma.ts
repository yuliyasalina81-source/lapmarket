/**
 * Единый экземпляр Prisma Client для всего приложения.
 * В dev-среде клиент кэшируется в globalThis, чтобы при hot reload
 * не создавать множество подключений к БД (паттерн singleton).
 */
import { PrismaClient } from "@prisma/client";

/** Глобальное хранилище клиента в не-production окружении. */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Переиспользуемый клиент Prisma (создаётся один раз). */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// В development сохраняем инстанс в global, чтобы HMR не плодил соединения
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
