"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Heart, AlertTriangle } from "lucide-react";
import { animals } from "@/lib/mock-data";
import type { AnimalListing } from "@/types";
import { AnimalCard } from "./animal-card";
import { Modal } from "@/components/ui/modal";
import { StaggerGrid, StaggerItem } from "@/components/ui/stagger-grid";
import { formatPrice } from "@/lib/format";

type Tab = "pedigree" | "goodHands";

export function AnimalsView() {
  const [tab, setTab] = useState<Tab>("pedigree");
  const [buyModal, setBuyModal] = useState<AnimalListing | null>(null);
  const [contactModal, setContactModal] = useState<AnimalListing | null>(null);

  const pedigree = animals.filter((a) => a.badges.includes("pedigree"));
  const goodHands = animals.filter((a) => a.badges.includes("goodHands"));
  const list = tab === "pedigree" ? pedigree : goodHands;

  const confirmBuy = () => {
    if (!buyModal) return;
    alert(
      `Заявка на покупку ${buyModal.name} принята (демо).\nМенеджер свяжется с вами для проверки документов.`
    );
    setBuyModal(null);
  };

  const confirmContact = () => {
    if (!contactModal) return;
    alert(
      `Чат с владельцем ${contactModal.name} открыт (демо).\nГород: ${contactModal.city}`
    );
    setContactModal(null);
  };

  const buyLabel =
    buyModal?.kind === "cat" ? "котёнка" : "щенка";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Животные
        </h1>
        <p className="mt-2 text-stone-600">
          Породистые с паспортом или питомцы в добрые руки
        </p>
      </motion.div>

      <div className="mt-8 flex gap-2 rounded-2xl bg-white/60 p-1.5 ring-1 ring-stone-200/60 sm:inline-flex">
        <TabButton
          active={tab === "pedigree"}
          onClick={() => setTab("pedigree")}
          icon={<BadgeCheck className="h-4 w-4" />}
          label="С галочкой"
          sub="🏅 Породистые с паспортом"
          activeClass="bg-emerald-500 text-white shadow-emerald-500/30"
        />
        <TabButton
          active={tab === "goodHands"}
          onClick={() => setTab("goodHands")}
          icon={<Heart className="h-4 w-4 fill-current" />}
          label="С сердечком"
          sub="❤️ В добрые руки"
          activeClass="bg-red-500 text-white shadow-red-500/30"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: tab === "pedigree" ? -12 : 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-8"
        >
          <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((animal) => (
              <StaggerItem key={animal.id}>
                <AnimalCard
                  animal={animal}
                  onBuy={setBuyModal}
                  onContact={setContactModal}
                />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </motion.div>
      </AnimatePresence>

      <Modal
        open={!!buyModal}
        onClose={() => setBuyModal(null)}
        title="Покупка питомца"
        size="md"
      >
        {buyModal && (
          <>
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">
                  Проверьте документы
                </p>
                <p className="mt-1 text-sm text-amber-800/90">
                  Перед покупкой {buyLabel} «{buyModal.name}» убедитесь в
                  подлинности паспорта РКФ/FIFe, ветпаспорта и договора с
                  сертифицированным питомником ЛапМаркет.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 rounded-2xl bg-stone-50 p-4">
              <span className="text-5xl">{buyModal.image}</span>
              <div>
                <p className="font-semibold text-stone-900">{buyModal.name}</p>
                <p className="text-sm text-stone-500">
                  {buyModal.breed} · {buyModal.city}
                </p>
                {buyModal.price && (
                  <p className="mt-2 text-xl font-bold text-emerald-700">
                    {formatPrice(buyModal.price)}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setBuyModal(null)}
                className="flex-1 rounded-2xl border border-stone-200 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={confirmBuy}
                className="flex-1 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600"
              >
                Подтвердить покупку
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={!!contactModal}
        onClose={() => setContactModal(null)}
        title="Связаться"
        size="sm"
      >
        {contactModal && (
          <>
            <p className="text-stone-600">
              Написать по объявлению <strong>{contactModal.name}</strong> (
              {contactModal.city})?
            </p>
            <button
              type="button"
              onClick={confirmContact}
              className="mt-4 w-full rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Открыть чат (демо)
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  sub,
  activeClass,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  sub: string;
  activeClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-start rounded-xl px-4 py-3 text-left transition sm:min-w-[200px] ${
        active
          ? `${activeClass} shadow-lg`
          : "text-stone-600 hover:bg-white"
      }`}
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {label}
      </span>
      <span
        className={`mt-0.5 text-xs ${active ? "text-white/90" : "text-stone-500"}`}
      >
        {sub}
      </span>
    </button>
  );
}
