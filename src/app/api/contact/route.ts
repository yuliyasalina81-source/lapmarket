import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

type ContactPayload = {
  source?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  clinicName?: string;
  city?: string;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactPayload;
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Укажите имя" },
        { status: 400 }
      );
    }

    const email = body.email?.trim();
    const phone = body.phone?.trim();
    const message = body.message?.trim();
    const source = body.source?.trim() || "chat";

    if (source === "chat" && !email && !phone) {
      return NextResponse.json(
        { ok: false, error: "Укажите email или телефон" },
        { status: 400 }
      );
    }

    if (source === "partner") {
      if (!email) {
        return NextResponse.json(
          { ok: false, error: "Укажите email" },
          { status: 400 }
        );
      }
      if (!phone) {
        return NextResponse.json(
          { ok: false, error: "Укажите телефон" },
          { status: 400 }
        );
      }
    }

    const payload = {
      source,
      name,
      email: email || undefined,
      phone: phone || undefined,
      message: message || undefined,
      clinicName: body.clinicName?.trim() || undefined,
      city: body.city?.trim() || undefined,
      at: new Date().toISOString(),
    };

    console.log("[contact]", payload);

    const contactTo = process.env.CONTACT_EMAIL?.trim();
    if (contactTo) {
      const lines = [
        `<p><strong>Источник:</strong> ${escapeHtml(source)}</p>`,
        `<p><strong>Имя:</strong> ${escapeHtml(name)}</p>`,
        email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : "",
        phone ? `<p><strong>Телефон:</strong> ${escapeHtml(phone)}</p>` : "",
        payload.clinicName
          ? `<p><strong>Клиника/салон:</strong> ${escapeHtml(payload.clinicName)}</p>`
          : "",
        payload.city ? `<p><strong>Город:</strong> ${escapeHtml(payload.city)}</p>` : "",
        message ? `<p><strong>Сообщение:</strong><br/>${escapeHtml(message)}</p>` : "",
      ].filter(Boolean);

      await sendEmail({
        to: contactTo,
        subject: `ЛапМаркет: заявка (${source})`,
        html: lines.join(""),
      });
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
