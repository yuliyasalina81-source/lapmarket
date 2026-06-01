"use client";

/** Client Component */
/** Страница объявлений: галочка, добрые руки, модалка контакта */

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AnimalCard } from "./animal-card";
import { StaggerGrid, StaggerItem } from "@/components/ui/stagger-grid";
import { Modal } from "@/components/ui/modal";
import { createContactRequest } from "@/actions/animals";
import type { ListingWithRelations } from "@/lib/queries/animals";
import type { AnimalBadge } from "@prisma/client";

/**
 * Список объявлений с фильтрами и созданием контакта
 */
export function AnimalsView({
  pedigreeListings,
  goodHandsListings,
  canCreate,
  isLoggedIn,
}: {
  pedigreeListings: ListingWithRelations[];
  goodHandsListings: ListingWithRelations[];
  canCreate: boolean;
  isLoggedIn: boolean;
}) {
  const [tab, setTab] = useState<"pedigree" | "goodHands">("pedigree");
  const [contactListing, setContactListing] = useState<ListingWithRelations | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const listings = tab === "pedigree" ? pedigreeListings : goodHandsListings;

  const submitContact = () => {
    if (!contactListing) return;
    startTransition(async () => {
      const result = await createContactRequest(contactListing.id, message);
      if (result.ok) {
        toast.success("Заявка отправлена продавцу");
        setContactListing(null);
        setMessage("");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Питомцы</h1>
          <p className="mt-2 text-stone-600">
            Породистые с документами или в добрые руки из приютов
          </p>
        </div>
        {canCreate && (
          <Link
            href="/listings/new"
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            + Новое объявление
          </Link>
        )}
      </div>

      <div className="mt-8 flex gap-2">
        <TabButton active={tab === "pedigree"} onClick={() => setTab("pedigree")} label="С паспортом" />
        <TabButton active={tab === "goodHands"} onClick={() => setTab("goodHands")} label="В добрые руки" />
      </div>

      {listings.length === 0 ? (
        <p className="mt-12 text-center text-stone-500">Объявлений пока нет</p>
      ) : (
        <StaggerGrid className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <StaggerItem key={listing.id}>
              <AnimalCard
                listing={listing}
                onContact={(l) => {
                  if (!isLoggedIn) {
                    toast.error("Войдите, чтобы связаться");
                    return;
                  }
                  setContactListing(l);
                }}
              />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}

      <Modal
        open={!!contactListing}
        onClose={() => setContactListing(null)}
        title={`Связаться: ${contactListing?.name ?? ""}`}
      >
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Расскажите о себе и условиях..."
          className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
        />
        <button
          type="button"
          onClick={submitContact}
          disabled={pending}
          className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "Отправка..." : "Отправить"}
        </button>
      </Modal>
    </div>
  );
}

/**
 * Вкладка «С галочкой» / «Добрые руки» на странице объявлений
 */
function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-sm font-medium transition ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-white text-stone-600 ring-1 ring-stone-200"
      }`}
    >
      {label}
    </button>
  );
}
