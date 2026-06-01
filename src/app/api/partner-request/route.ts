/** POST /api/partner-request — заявка партнёра (клиника) с /for-business, письмо через Resend */
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getEmailFrom, getResendApiKey } from "@/lib/env";

export const runtime = "nodejs";

type PartnerRequestBody = {
  name?: string;
  clinicName?: string;
  phone?: string;
  email?: string;
  city?: string;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPartnerEmailHtml(fields: Record<string, string>) {
  const rows = Object.entries(fields)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e7e5e4;font-weight:600;color:#44403c;">${escapeHtml(label)}</td><td style="padding:8px 12px;border:1px solid #e7e5e4;color:#292524;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  return `
    <h2 style="font-family:sans-serif;color:#059669;">Новая заявка партнёра — ЛапМаркет</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;max-width:480px;">
      ${rows}
    </table>
    <p style="font-family:sans-serif;font-size:12px;color:#78716c;margin-top:16px;">Отправлено с lapmarket.ru/for-business</p>
  `;
}

export async function POST(req: Request) {
  try {
    const apiKey = getResendApiKey();
    const notifyEmail = process.env["PARTNER_NOTIFY_EMAIL"]?.trim();

    if (!apiKey || !notifyEmail) {
      console.error(
        "[partner-request] Missing RESEND_API_KEY or PARTNER_NOTIFY_EMAIL"
      );
      return NextResponse.json(
        {
          ok: false,
          error:
            "Сервис заявок не настроен. Добавьте RESEND_API_KEY и PARTNER_NOTIFY_EMAIL в переменные окружения.",
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as PartnerRequestBody;
    const name = body.name?.trim();
    const clinicName = body.clinicName?.trim();
    const phone = body.phone?.trim();
    const email = body.email?.trim();
    const city = body.city?.trim();

    if (!name || !clinicName || !phone || !email || !city) {
      return NextResponse.json(
        { ok: false, error: "Заполните все поля формы" },
        { status: 400 }
      );
    }

    const from = getEmailFrom();
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from,
      to: notifyEmail,
      subject: `Новая заявка от партнёра: ${clinicName}`,
      html: buildPartnerEmailHtml({
        Имя: name,
        "Клиника / салон": clinicName,
        Телефон: phone,
        Email: email,
        Город: city,
      }),
      replyTo: email,
    });

    if (error) {
      console.error("[partner-request] Resend error:", error);
      return NextResponse.json(
        {
          ok: false,
          error: "Не удалось отправить письмо. Попробуйте позже или напишите нам в чат.",
        },
        { status: 502 }
      );
    }

    console.log("[partner-request] sent", { clinicName, email, city });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[partner-request]", e);
    return NextResponse.json(
      { ok: false, error: "Не удалось отправить заявку" },
      { status: 500 }
    );
  }
}
