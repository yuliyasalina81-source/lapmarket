import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserBookings } from "@/lib/queries/services";
import { SERVICE_KIND_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { BookingReviewForm } from "@/components/profile/booking-review-form";
import { CancelBookingButton } from "@/components/profile/cancel-booking-button";

export const metadata = { title: "Мои записи — ЛапМаркет" };

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const bookings = await getUserBookings(session.user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/profile" className="text-sm text-emerald-700 hover:underline">
        ← Профиль
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900">Мои записи</h1>
      <div className="mt-8 space-y-4">
        {bookings.length === 0 ? (
          <p className="text-stone-500">
            Записей пока нет.{" "}
            <Link href="/services" className="text-emerald-700 hover:underline">
              Записаться на услугу
            </Link>
          </p>
        ) : (
          bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-stone-100 bg-white p-4"
            >
              <p className="font-semibold text-stone-900">{b.provider.name}</p>
              <p className="text-sm text-stone-500">
                {SERVICE_KIND_LABELS[b.provider.kind]} · {b.status}
                {b.pet ? ` · ${b.pet.name}` : ""}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                {new Intl.DateTimeFormat("ru-RU", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(b.scheduledAt)}
              </p>
              <p className="text-sm text-emerald-700">
                от {formatPrice(b.provider.priceFrom)}
              </p>
              {b.note && <p className="mt-2 text-sm text-stone-500">{b.note}</p>}
              {b.status === "NEW" && <CancelBookingButton bookingId={b.id} />}
              {b.status === "CONFIRMED" && !b.review && (
                <BookingReviewForm bookingId={b.id} />
              )}
              {b.pet && (
                <Link
                  href={`/pets/${b.pet.id}`}
                  className="mt-2 inline-block text-xs text-emerald-700 hover:underline"
                >
                  Добавить визит в медкарту →
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
