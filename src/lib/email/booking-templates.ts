/**
 * HTML-шаблоны писем о записях на услуги.
 */

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type BookingEmailData = {
  title: string;
  providerName: string;
  serviceName?: string | null;
  clientName: string;
  scheduledAt: string;
  status: string;
  note?: string | null;
  link?: string;
  /** Временно: кому предназначалось письмо (пока домен не верифицирован в Resend) */
  intendedFor?: string;
};

export function buildBookingEmailHtml(data: BookingEmailData): string {
  const fields: [string, string][] = [
    ...(data.intendedFor
      ? [["Предназначалось", data.intendedFor] as [string, string]]
      : []),
    ["Специалист", data.providerName],
    ...(data.serviceName ? [["Услуга", data.serviceName] as [string, string]] : []),
    ["Клиент", data.clientName],
    ["Дата и время", data.scheduledAt],
    ["Статус", data.status],
    ...(data.note ? [["Комментарий", data.note] as [string, string]] : []),
  ];

  const rows = fields
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e7e5e4;font-weight:600;color:#44403c;">${escapeHtml(label)}</td><td style="padding:8px 12px;border:1px solid #e7e5e4;color:#292524;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const linkBlock = data.link
    ? `<p style="margin-top:16px;"><a href="${escapeHtml(data.link)}" style="color:#059669;font-weight:600;">Открыть в ЛапМаркет</a></p>`
    : "";

  return `
    <h2 style="font-family:sans-serif;color:#059669;">${escapeHtml(data.title)}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;max-width:520px;">
      ${rows}
    </table>
    ${linkBlock}
    <p style="font-family:sans-serif;font-size:12px;color:#78716c;margin-top:16px;">ЛапМаркет — запись на услуги</p>
  `;
}
