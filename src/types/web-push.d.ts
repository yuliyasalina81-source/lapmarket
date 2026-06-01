/**
 * Минимальные типы для пакета web-push (VAPID и sendNotification), если @types/web-push нет.
 */
declare module "web-push" {
  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;
  export function sendNotification(
    subscription: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    },
    payload: string | Buffer | null,
    options?: Record<string, unknown>
  ): Promise<{ statusCode: number }>;
}
