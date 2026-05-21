"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { services } from "@/lib/mock-data";
import type { ServiceProvider } from "@/types";
import { ServiceCard } from "./service-card";
import { Modal } from "@/components/ui/modal";
import { StaggerGrid, StaggerItem } from "@/components/ui/stagger-grid";
import { formatPrice } from "@/lib/format";

export function ServicesView() {
  const [booking, setBooking] = useState<ServiceProvider | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");

  const confirm = () => {
    if (!booking) return;
    alert(
      `Запись подтверждена (демо)\n\n${booking.name}\n${date || "ближайшая дата"} в ${time}\n${booking.address}`
    );
    setBooking(null);
    setDate("");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Ветеринары и грумеры
        </h1>
        <p className="mt-2 text-stone-600">
          Специалисты с проверенной лицензией, рейтингом и прозрачными ценами
        </p>
      </motion.div>

      <StaggerGrid className="mt-8 flex flex-col gap-5">
        {services.map((service) => (
          <StaggerItem key={service.id}>
            <ServiceCard service={service} onBook={setBooking} />
          </StaggerItem>
        ))}
      </StaggerGrid>

      <Modal
        open={!!booking}
        onClose={() => setBooking(null)}
        title="Запись на приём"
        size="md"
      >
        {booking && (
          <>
            <p className="text-sm text-stone-600">
              <span className="font-semibold text-stone-900">{booking.name}</span>
              <br />
              {booking.address} · от {formatPrice(booking.priceFrom)}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-stone-500">Дата</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-stone-500">Время</span>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                >
                  {["09:00", "10:00", "11:30", "14:00", "16:00", "18:00"].map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={confirm}
              className="mt-6 w-full rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600"
            >
              Подтвердить запись
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}
