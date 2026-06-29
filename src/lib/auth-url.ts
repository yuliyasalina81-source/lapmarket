/**
 * Канонический URL приложения для NextAuth (Auth.js v5).
 * На Vercel используйте AUTH_URL; NEXTAUTH_URL — legacy-алиас.
 */
export function getAuthBaseUrl(): string | undefined {
  const raw = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (!raw) return undefined;
  return raw.replace(/\/$/, "");
}
