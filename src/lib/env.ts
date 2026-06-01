/**
 * Чтение server-only переменных окружения в рантайме.
 * Динамический доступ process.env[name] — чтобы Next.js не подставил
 * undefined при сборке, если ключа не было в .env на build-машине.
 */

function readEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getResendApiKey(): string | undefined {
  return readEnv("RESEND_API_KEY");
}

export function getEmailFrom(): string {
  return readEnv("EMAIL_FROM") ?? "LapMarket <onboarding@resend.dev>";
}

export function getContactEmail(): string {
  return readEnv("CONTACT_EMAIL") ?? "yaroslav937148@gmail.com";
}

export function isProductionRuntime(): boolean {
  const vercel = readEnv("VERCEL_ENV");
  if (vercel === "production" || vercel === "preview") return true;
  return process.env.NODE_ENV === "production";
}
