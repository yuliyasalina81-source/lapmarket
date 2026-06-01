/**
 * Отправка email через Resend API; в dev без ключа — лог в консоль.
 */

/**
 * Отправляет письмо получателю (или логирует в dev).
 * @param params to, subject, html
 * @returns { ok: true } или { ok: false, error } при сбое API
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  // Нет ключа — режим разработки, не бросаем ошибку
  if (!apiKey) {
    console.info("[email:dev]", params.to, params.subject);
    return { ok: true as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "LapMarket <onboarding@resend.dev>",
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { reply_to: params.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    console.error("[email]", await res.text());
    return { ok: false as const, error: "Не удалось отправить письмо" };
  }
  return { ok: true as const };
}
