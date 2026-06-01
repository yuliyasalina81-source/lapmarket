/** POST /api/contact — заявка с виджета «Связаться с нами», письмо через Resend */
import { NextResponse } from "next/server";
import { getContactEmail } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { contactRequestSchema } from "@/lib/validations/contact";

export const runtime = "nodejs";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildContactEmailHtml(data: {
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  source: string;
  clinicName?: string;
  city?: string;
}) {
  const fields: [string, string][] = [
    ["Имя", data.name],
    ...(data.email ? [["Email", data.email] as [string, string]] : []),
    ...(data.phone ? [["Телефон", data.phone] as [string, string]] : []),
    ...(data.clinicName
      ? [["Клиника / салон", data.clinicName] as [string, string]]
      : []),
    ...(data.city ? [["Город", data.city] as [string, string]] : []),
    ...(data.message ? [["Сообщение", data.message] as [string, string]] : []),
    ["Источник", data.source],
    [
      "Время",
      new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }),
    ],
  ];

  const rows = fields
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e7e5e4;font-weight:600;color:#44403c;">${escapeHtml(label)}</td><td style="padding:8px 12px;border:1px solid #e7e5e4;color:#292524;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  return `
    <h2 style="font-family:sans-serif;color:#059669;">Новая заявка с сайта</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;max-width:520px;">
      ${rows}
    </table>
    <p style="font-family:sans-serif;font-size:12px;color:#78716c;margin-top:16px;">ЛапМаркет — форма обратной связи</p>
  `;
}

function firstZodError(flat: {
  fieldErrors: Record<string, string[] | undefined>;
  formErrors: string[];
}): string {
  for (const messages of Object.values(flat.fieldErrors)) {
    if (messages?.[0]) return messages[0];
  }
  return flat.formErrors[0] ?? "Проверьте данные формы";
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Слишком много попыток. Повторите через ${rate.retryAfterSec} сек.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        }
      );
    }

    const json: unknown = await req.json();
    const parsed = contactRequestSchema.safeParse(json);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      return NextResponse.json(
        { ok: false, error: firstZodError(flat) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.company?.trim()) {
      return NextResponse.json({ ok: true });
    }

    const emailResult = await sendEmail({
      to: getContactEmail(),
      subject: "Новая заявка с сайта",
      html: buildContactEmailHtml({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        source: data.source,
        clinicName: data.clinicName,
        city: data.city,
      }),
      replyTo: data.email,
    });

    if (!emailResult.ok) {
      return NextResponse.json(
        { ok: false, error: emailResult.error ?? "Не удалось отправить письмо" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[contact]", e);
    return NextResponse.json(
      { ok: false, error: "Не удалось отправить заявку" },
      { status: 500 }
    );
  }
}
