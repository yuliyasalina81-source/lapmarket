/**
 * Уведомления о записях: in-app + email (клиент, специалист, админ).
 */
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendEmail } from "@/lib/email";
import { buildBookingEmailHtml } from "@/lib/email/booking-templates";
import { getAdminNotifyEmail } from "@/lib/env";

export type BookingEvent = "CREATED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Ожидает подтверждения",
  CONFIRMED: "Подтверждена",
  CANCELLED: "Отменена",
  COMPLETED: "Завершена",
};

function formatScheduledAt(date: Date): string {
  return date.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
}

function getBaseUrl(): string {
  return process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

async function sendBookingEmail(
  to: string | null | undefined,
  subject: string,
  data: Parameters<typeof buildBookingEmailHtml>[0]
) {
  if (!to) return;
  void sendEmail({ to, subject, html: buildBookingEmailHtml(data) });
}

/**
 * Отправляет in-app и email уведомления по событию записи.
 * @param event Тип события
 * @param bookingId ID ServiceBooking
 * @param cancelledByCustomer true если отменил клиент
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
  const providerName = booking.provider.name;
  const serviceName = booking.service?.name;
  const scheduledAt = formatScheduledAt(booking.scheduledAt);
  const statusLabel = STATUS_LABELS[booking.status] ?? booking.status;
  const baseUrl = getBaseUrl();
  const petNote = booking.pet ? ` · ${booking.pet.name}` : "";

  const emailBase = {
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
      void sendBookingEmail(booking.user.email, "Запись создана — ЛапМаркет", {
        title: "Запись создана",
        ...emailBase,
        link: `${baseUrl}/dashboard/client`,
      });
      void sendBookingEmail(booking.provider.user.email, "Новая запись — ЛапМаркет", {
        title: "Новая запись от клиента",
        ...emailBase,
        link: `${baseUrl}/dashboard/specialist`,
      });
      const adminEmail = getAdminNotifyEmail();
      if (adminEmail) {
        void sendBookingEmail(adminEmail, "Новая запись на услугу — ЛапМаркет", {
          title: "Новая запись на услугу",
          ...emailBase,
          link: `${baseUrl}/specialist/${booking.providerId}`,
        });
      }
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
      void sendBookingEmail(booking.user.email, "Запись подтверждена — ЛапМаркет", {
        title: "Запись подтверждена",
        ...emailBase,
        link: `${baseUrl}/dashboard/client`,
      });
      const adminEmail = getAdminNotifyEmail();
      if (adminEmail) {
        void sendBookingEmail(adminEmail, "Запись подтверждена — ЛапМаркет", {
          title: "Запись подтверждена",
          ...emailBase,
          link: `${baseUrl}/specialist/${booking.providerId}`,
        });
      }
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
      void sendBookingEmail(booking.user.email, "Запись отменена — ЛапМаркет", {
        title: "Запись отменена",
        ...emailBase,
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
        void sendBookingEmail(
          booking.provider.user.email,
          "Клиент отменил запись — ЛапМаркет",
          {
            title: "Клиент отменил запись",
            ...emailBase,
            link: `${baseUrl}/dashboard/specialist`,
          }
        );
      }
      const adminEmail = getAdminNotifyEmail();
      if (adminEmail) {
        void sendBookingEmail(adminEmail, "Запись отменена — ЛапМаркет", {
          title: "Запись отменена",
          ...emailBase,
          link: `${baseUrl}/specialist/${booking.providerId}`,
        });
      }
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
      void sendBookingEmail(booking.user.email, "Визит завершён — ЛапМаркет", {
        title: "Визит завершён",
        ...emailBase,
        link: `${baseUrl}/dashboard/client`,
      });
      break;
    }
  }
}
