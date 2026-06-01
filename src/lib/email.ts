/**
 * Отправка email через Resend SDK.
 */
import { Resend } from "resend";
import { getEmailFrom, getResendApiKey, isProductionRuntime } from "@/lib/env";

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = getResendApiKey();
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Отправляет письмо через Resend.
 * На production без ключа — ошибка (не тихий успех).
 * Локально без ключа — лог и ok: false.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendEmailResult> {
  const resend = getResend();

  if (!resend) {
    const msg = "RESEND_API_KEY не задан";
    if (isProductionRuntime()) {
      console.error("[email:resend] missing API key on", process.env.VERCEL_ENV ?? "production");
      return { ok: false, error: "Сервис почты не настроен" };
    }
    console.info("[email:dev]", params.to, params.subject, `(${msg})`);
    return { ok: false, error: msg };
  }

  const from = getEmailFrom();

  const { data, error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    ...(params.replyTo ? { replyTo: params.replyTo } : {}),
  });

  if (error) {
    console.error("[email:resend] send failed:", error);
    return {
      ok: false,
      error: error.message || "Не удалось отправить письмо",
    };
  }

  console.info("[email:resend] sent", {
    id: data?.id,
    to: params.to,
    subject: params.subject,
    from,
  });

  return { ok: true, id: data?.id };
}
