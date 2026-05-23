"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelBooking } from "@/actions/services";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Отменить запись?")) return;
        startTransition(async () => {
          const result = await cancelBooking(bookingId);
          if (result.ok) {
            toast.success("Запись отменена");
            router.refresh();
          } else toast.error(result.error);
        });
      }}
      className="mt-3 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "Отмена..." : "Отменить запись"}
    </button>
  );
}
