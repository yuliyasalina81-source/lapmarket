/**
 * Уведомления о записях: in-app + email (клиент, специалист, админ).
 *
 * ВРЕМЕННО: все email клиенту и специалисту уходят на ADMIN_NOTIFY_EMAIL,
 * пока не верифицирован домен в Resend.
 */
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendEmail } from "@/lib/email";
import { buildBookingEmailHtml } from "@/lib/email/booking-templates";
import type { BookingEmailData } from "@/lib/email/booking-templates";
import { getAdminNotifyEmail } from "@/lib/env";

export type BookingEvent = "CREATED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Ожидает подтверждения",
  CONFIRMED: "Подтверждена",
  CANCELLED: "Отменена",
  COMPLETED: "Завершена",
};

/** Fallback, если ADMIN_NOTIFY_EMAIL не задан в .env */
const ADMIN_EMAIL_FALLBACK = "yaroslav937148@gmail.com";

function formatScheduledAt(date: Date): string {
  return date.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
}

function getBaseUrl(): string {
  return process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

function getBookingAdminEmail(): string {
  return getAdminNotifyEmail() ?? ADMIN_EMAIL_FALLBACK;
}

function formatRecipient(name: string, email: string | null | undefined): string {
  return email ? `${name} (${email})` : name;
}

async function sendBookingEmail(
  to: string,
  subject: string,
  data: BookingEmailData
) {
  void sendEmail({ to, subject, html: buildBookingEmailHtml(data) });
}

/** Временно: письмо клиенту → на ADMIN_NOTIFY_EMAIL */
function notifyClient(
  recipientName: string,
  recipientEmail: string | null | undefined,
  subject: string,
  data: BookingEmailData
) {
  void sendBookingEmail(getBookingAdminEmail(), subject, {
    ...data,
    intendedFor: `Клиенту: ${formatRecipient(recipientName, recipientEmail)}`,
  });
}

/** Временно: письмо специалисту → на ADMIN_NOTIFY_EMAIL */
function notifySpecialist(
  recipientName: string,
  recipientEmail: string | null | undefined,
  subject: string,
  data: BookingEmailData
) {
  void sendBookingEmail(getBookingAdminEmail(), subject, {
    ...data,
    intendedFor: `Специалисту: ${formatRecipient(recipientName, recipientEmail)}`,
  });
}

/** Письмо администратору */
function notifyAdmin(subject: string, data: BookingEmailData) {
  const adminEmail = getAdminNotifyEmail() ?? ADMIN_EMAIL_FALLBACK;
  void sendBookingEmail(adminEmail, subject, data);
}

/**
 * Отправляет in-app и email уведомления по событию записи.
 */
export async function notifyBookingEvent(
  event: BookingEvent,
  bookingId: string,
  options?: { cancelledByCustomer?: boolean }
): Promise<void> {
  const booking = await prisma.serviceBooking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { id: true, displayName: true, email: true } },
      provider: {
        select: {
          id: true,
          name: true,
          user: { select: { id: true, displayName: true, email: true } },
        },
      },
      service: { select: { name: true } },
      pet: { select: { name: true } },
    },
  });

  if (!booking) return;

  const clientName = booking.user.displayName ?? "Клиент";
  const clientEmail = booking.user.email;
  const specialistName = booking.provider.user.displayName ?? booking.provider.name;
  const specialistEmail = booking.provider.user.email;
  const providerName = booking.provider.name;
  const serviceName = booking.service?.name;
  const scheduledAt = formatScheduledAt(booking.scheduledAt);
  const statusLabel = STATUS_LABELS[booking.status] ?? booking.status;
  const baseUrl = getBaseUrl();
  const petNote = booking.pet ? ` · ${booking.pet.name}` : "";

  const emailBase: BookingEmailData = {
    title: "",
    providerName,
    serviceName,
    clientName,
    scheduledAt,
    status: statusLabel,
    note: booking.note,
  };

  switch (event) {
    case "CREATED": {
      const body = `${serviceName ?? "Услуга"} — ${scheduledAt}${petNote}`;
      await createNotification({
        userId: booking.userId,
        type: "BOOKING_UPDATE",
        title: "Запись создана",
        body,
        link: "/dashboard/client",
      });
      await createNotification({
        userId: booking.provider.user.id,
        type: "BOOKING_UPDATE",
        title: "Новая запись",
        body: `${clientName} — ${body}`,
        link: "/dashboard/specialist",
      });
      notifyClient(clientName, clientEmail, "Запись создана — ЛапМаркет", {
        ...emailBase,
        title: "Запись создана",
        link: `${baseUrl}/dashboard/client`,
      });
      notifySpecialist(
        specialistName,
        specialistEmail,
        "Новая запись — ЛапМаркет",
        {
          ...emailBase,
          title: "Новая запись от клиента",
          link: `${baseUrl}/dashboard/specialist`,
        }
      );
      notifyAdmin("Новая запись на услугу — ЛапМаркет", {
        ...emailBase,
        title: "Новая запись на услугу",
        link: `${baseUrl}/specialist/${booking.providerId}`,
      });
      break;
    }
    case "CONFIRMED": {
      await createNotification({
        userId: booking.userId,
        type: "BOOKING_UPDATE",
        title: "Запись подтверждена",
        body: `${providerName} — ${scheduledAt}`,
        link: "/dashboard/client",
      });
      notifyClient(clientName, clientEmail, "Запись подтверждена — ЛапМаркет", {
        ...emailBase,
        title: "Запись подтверждена",
        link: `${baseUrl}/dashboard/client`,
      });
      notifyAdmin("Запись подтверждена — ЛапМаркет", {
        ...emailBase,
        title: "Запись подтверждена",
        link: `${baseUrl}/specialist/${booking.providerId}`,
      });
      break;
    }
    case "CANCELLED": {
      await createNotification({
        userId: booking.userId,
        type: "BOOKING_UPDATE",
        title: "Запись отменена",
        body: `${providerName} — ${scheduledAt}`,
        link: "/dashboard/client",
      });
      notifyClient(clientName, clientEmail, "Запись отменена — ЛапМаркет", {
        ...emailBase,
        title: "Запись отменена",
        link: `${baseUrl}/dashboard/client`,
      });
      if (options?.cancelledByCustomer) {
        await createNotification({
          userId: booking.provider.user.id,
          type: "BOOKING_UPDATE",
          title: "Клиент отменил запись",
          body: `${clientName} — ${scheduledAt}`,
          link: "/dashboard/specialist",
        });
        notifySpecialist(
          specialistName,
          specialistEmail,
          "Клиент отменил запись — ЛапМаркет",
          {
            ...emailBase,
            title: "Клиент отменил запись",
            link: `${baseUrl}/dashboard/specialist`,
          }
        );
      }
      notifyAdmin("Запись отменена — ЛапМаркет", {
        ...emailBase,
        title: "Запись отменена",
        link: `${baseUrl}/specialist/${booking.providerId}`,
      });
      break;
    }
    case "COMPLETED": {
      await createNotification({
        userId: booking.userId,
        type: "BOOKING_UPDATE",
        title: "Визит завершён",
        body: `${providerName} — ${serviceName ?? "Услуга"}`,
        link: "/dashboard/client",
      });
      notifyClient(clientName, clientEmail, "Визит завершён — ЛапМаркет", {
        ...emailBase,
        title: "Визит завершён",
        link: `${baseUrl}/dashboard/client`,
      });
      break;
    }
  }
}
