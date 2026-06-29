"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";

type ServiceOption = {
  id: string;
  name: string;
  duration: number;
};

type SlotItem = {
  id: string;
  serviceId: string | null;
  serviceName: string | null;
  startAt: string;
  endAt: string;
  isBooked: boolean;
  bookedBy: "USER" | "MANUAL" | null;
  bookingId: string | null;
  bookingStatus: string | null;
  note: string | null;
  label: string;
  date: string;
};

function formatYmd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function SlotManager({ services }: { services: ServiceOption[] }) {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [serviceId, setServiceId] = useState("");
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");

  const range = useMemo(() => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + (period === "week" ? 6 : 29));
    return { from: formatYmd(from), to: formatYmd(to) };
  }, [period]);

  const grouped = useMemo(() => {
    const map = new Map<string, SlotItem[]>();
    for (const slot of slots) {
      const arr = map.get(slot.date) ?? [];
      arr.push(slot);
      map.set(slot.date, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      from: range.from,
      to: range.to,
    });
    if (serviceId) params.set("serviceId", serviceId);
    const res = await fetch(`/api/specialist/slots/manage?${params.toString()}`);
    const data = await res.json();
    if (data.ok) {
      setSlots(data.slots);
    } else {
      toast.error(data.error ?? "Не удалось загрузить слоты");
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [range.from, range.to, serviceId]);

  const closeModal = () => {
    setSelectedSlot(null);
    setClientName("");
    setPhone("");
    setComment("");
  };

  const bookManual = () => {
    if (!selectedSlot) return;
    startTransition(async () => {
      const res = await fetch(`/api/specialist/slots/${selectedSlot.id}/book-manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          phone,
          comment: comment || undefined,
          serviceId: serviceId || selectedSlot.serviceId || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Слот забронирован вручную");
        closeModal();
        await load();
      } else {
        toast.error(data.error ?? "Не удалось забронировать слот");
      }
    });
  };

  const releaseSlot = (slot: SlotItem) => {
    if (!confirm("Вы уверены?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/specialist/slots/${slot.id}/release`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Слот освобождён");
        await load();
      } else {
        toast.error(data.error ?? "Не удалось освободить слот");
      }
    });
  };

  return (
    <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Управление слотами</h2>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as "week" | "month")}
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        >
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
        </select>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        >
          <option value="">Все услуги</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800">
          Свободные
        </span>
        <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-800">
          Занятые через сайт
        </span>
        <span className="rounded-full bg-orange-100 px-2 py-1 text-orange-800">
          Занятые вручную
        </span>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-stone-500">Загрузка слотов...</p>
      ) : grouped.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">Слоты за выбранный период не найдены.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {grouped.map(([date, daySlots]) => (
            <div key={date} className="rounded-xl border border-stone-100 p-3">
              <p className="mb-2 text-sm font-semibold text-stone-900">{date}</p>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => {
                  const className = !slot.isBooked
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    : slot.bookedBy === "MANUAL"
                      ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200";

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        slot.isBooked ? releaseSlot(slot) : setSelectedSlot(slot)
                      }
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${className}`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selectedSlot} onClose={closeModal} title="Забронировать вручную" size="sm">
        <div className="space-y-3">
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Имя клиента"
            className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Телефон"
            className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Комментарий (опционально)"
            rows={3}
            className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={pending || !clientName.trim() || !phone.trim()}
            onClick={bookManual}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Бронирование..." : "Забронировать"}
          </button>
        </div>
      </Modal>
    </section>
  );
}
