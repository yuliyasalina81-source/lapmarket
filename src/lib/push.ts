import { prisma } from "@/lib/prisma";

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return;

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return;

  let webpush: typeof import("web-push");
  try {
    webpush = await import("web-push");
  } catch {
    return;
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:support@lapmarket.app",
    publicKey,
    privateKey
  );

  const data = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/",
  });

  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        data
      )
    )
  );
}
