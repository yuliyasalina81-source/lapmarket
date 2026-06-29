/**
 * Локальный прогон: создание записи + notifyBookingEvent (логи [booking]).
 * Запуск: npx tsx scripts/test-booking-log.ts
 */
import { prisma } from "../src/lib/prisma";
import { notifyBookingEvent } from "../src/lib/booking-notifications";

async function main() {
  console.log("[booking] API called");

  const user = await prisma.user.findFirst({
    where: { email: "maria@example.com" },
  });
  if (!user) {
    console.error("Нет пользователя maria@example.com — выполните npm run db:seed");
    process.exit(1);
  }

  let provider = await prisma.serviceProvider.findFirst({
    where: { verified: true },
  });
  if (!provider) {
    provider = await prisma.serviceProvider.findFirst();
  }
  if (!provider) {
    console.error("Нет ServiceProvider — выполните npm run db:seed");
    process.exit(1);
  }

  let service = await prisma.service.findFirst({
    where: { providerId: provider.id, isActive: true },
  });
  if (!service) {
    service = await prisma.service.create({
      data: {
        providerId: provider.id,
        name: "Тестовый приём",
        price: 1500,
        duration: 30,
        category: "VET",
      },
    });
  }

  const booking = await prisma.serviceBooking.create({
    data: {
      providerId: provider.id,
      serviceId: service.id,
      userId: user.id,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: "PENDING",
      note: "Тест логов booking",
    },
  });

  console.log("[booking] created", booking.id);

  await notifyBookingEvent("CREATED", booking.id);

  console.log("[test] done, booking id:", booking.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
