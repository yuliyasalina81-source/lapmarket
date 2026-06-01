"use client";

/** Client Component */
/** Паспорт питомца: данные, прививки, вес */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Syringe,
  FileText,
  Bell,
  Scale,
  Pencil,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/components/ui/product-image";
import {
  addVaccination,
  addMedicalRecord,
  addWeightLog,
  deleteVaccination,
  deleteMedicalRecord,
  deleteWeightLog,
} from "@/actions/health";
import {
  createReminder,
  updateReminderStatus,
  deleteReminder,
} from "@/actions/reminders";
import { WeightChart } from "@/components/pets/weight-chart";
import { HealthRecordActions } from "@/components/pets/health-record-actions";
import { createPetShareToken } from "@/actions/pets";
import type { PetDetail } from "@/lib/queries/pets";
import type { AnimalKind } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { PetGallery } from "@/components/pets/pet-gallery";
import { PetAiTips } from "@/components/pets/pet-ai-tips";

const kindLabels: Record<AnimalKind, string> = {
  DOG: "Собака",
  CAT: "Кошка",
  BIRD: "Птица",
  RODENT: "Грызун",
  OTHER: "Другое",
};

type Tab = "overview" | "health" | "reminders" | "weight";

/**
 * Детальная карточка питомца с историей
 */
export function PetPassport({ pet }: { pet: PetDetail }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [pending, startTransition] = useTransition();

  const tabs: { id: Tab; label: string; icon: typeof Syringe }[] = [
    { id: "overview", label: "Обзор", icon: FileText },
    { id: "health", label: "Здоровье", icon: Syringe },
    { id: "reminders", label: "Напоминания", icon: Bell },
    { id: "weight", label: "Вес", icon: Scale },
  ];

  const exportPdf = () => {
    window.open(`/pets/${pet.id}/export`, "_blank");
  };

  const shareLink = () => {
    startTransition(async () => {
      const result = await createPetShareToken(pet.id);
      if (result.ok && result.token) {
        const url = `${window.location.origin}/share/pet/${result.token}`;
        await navigator.clipboard.writeText(url);
        toast.success("Ссылка скопирована (30 дней)");
      } else if (!result.ok) toast.error(result.error);
    });
  };

  return (
    <div>
      <div className="relative h-48 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100 to-violet-100">
        {pet.avatarMedia?.url ? (
          <ProductImage src={pet.avatarMedia.url} alt={pet.name} fill />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">🐾</div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{pet.name}</h1>
          <p className="text-stone-600">
            {kindLabels[pet.kind]}
            {pet.breed ? ` · ${pet.breed}` : ""}
            {pet.weightKg ? ` · ${pet.weightKg} кг` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/pets/${pet.id}/edit`}
            className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium hover:bg-stone-50"
          >
            <Pencil className="h-4 w-4" />
            Изменить
          </Link>
          <button
            type="button"
            onClick={exportPdf}
            className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium hover:bg-stone-50"
          >
            <Download className="h-4 w-4" />
            Скачать паспорт
          </button>
          <button
            type="button"
            onClick={shareLink}
            disabled={pending}
            className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Поделиться
          </button>
        </div>
      </div>

      <nav className="mt-6 flex gap-1 overflow-x-auto rounded-2xl bg-stone-100 p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === id ? "bg-white text-emerald-800 shadow-sm" : "text-stone-600"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="space-y-4 rounded-2xl border border-stone-100 bg-white p-6">
            {pet.microchip && (
              <p className="text-sm">
                <span className="font-medium text-stone-700">Чип:</span> {pet.microchip}
              </p>
            )}
            {pet.birthDate && (
              <p className="text-sm">
                <span className="font-medium text-stone-700">Дата рождения:</span>{" "}
                {pet.birthDate.toLocaleDateString("ru-RU")}
              </p>
            )}
            {pet.notes && <p className="text-sm text-stone-600">{pet.notes}</p>}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <Stat label="Прививок" value={pet._count.vaccinations} />
              <Stat label="Записей" value={pet._count.medicalRecords} />
              <Stat label="Напоминаний" value={pet._count.reminders} />
            </div>
            <Link
              href={`/services?petId=${pet.id}`}
              className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline"
            >
              Записаться к ветеринару →
            </Link>
            <PetGallery petId={pet.id} items={pet.gallery ?? []} />
            <PetAiTips petId={pet.id} />
          </div>
        )}

        {tab === "health" && (
          <div className="space-y-8">
            <HealthSection
              title="Прививки"
              onSubmit={(fd) => {
                startTransition(async () => {
                  const r = await addVaccination(pet.id, fd);
                  if (r.ok) toast.success("Добавлено");
                  else toast.error(r.error);
                });
              }}
            >
              <input name="name" placeholder="Название" required className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
              <input name="date" type="date" required className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
              <input name="nextDueAt" type="date" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
              <input name="clinic" placeholder="Клиника" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
            </HealthSection>
            <ul className="space-y-2">
              {pet.vaccinations.map((v) => (
                <li
                  key={v.id}
                  className="flex items-start justify-between rounded-xl bg-emerald-50/50 px-4 py-3 text-sm"
                >
                  <span>
                    <strong>{v.name}</strong> — {v.date.toLocaleDateString("ru-RU")}
                    {v.clinic && ` · ${v.clinic}`}
                  </span>
                  <HealthRecordActions
                    onDelete={async () => {
                      const r = await deleteVaccination(v.id);
                      return { ok: r.ok, error: r.ok ? undefined : r.error };
                    }}
                  />
                </li>
              ))}
            </ul>

            <HealthSection
              title="Медкарта"
              onSubmit={(fd) => {
                startTransition(async () => {
                  const r = await addMedicalRecord(pet.id, fd);
                  if (r.ok) toast.success("Добавлено");
                  else toast.error(r.error);
                });
              }}
            >
              <input name="title" placeholder="Заголовок" required className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
              <input name="date" type="date" required className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
              <input name="providerName" placeholder="Врач / клиника" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
              <textarea name="diagnosis" placeholder="Диагноз" rows={2} className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
              <textarea name="treatment" placeholder="Лечение" rows={2} className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
            </HealthSection>
            <ul className="space-y-2">
              {pet.medicalRecords.map((m) => (
                <li
                  key={m.id}
                  className="flex items-start justify-between rounded-xl border border-stone-100 px-4 py-3 text-sm"
                >
                  <div>
                    <strong>{m.title}</strong> — {m.date.toLocaleDateString("ru-RU")}
                    {m.diagnosis && <p className="mt-1 text-stone-600">{m.diagnosis}</p>}
                    {m.treatment && (
                      <p className="mt-1 text-stone-500">Лечение: {m.treatment}</p>
                    )}
                  </div>
                  <HealthRecordActions
                    onDelete={async () => {
                      const r = await deleteMedicalRecord(m.id);
                      return { ok: r.ok, error: r.ok ? undefined : r.error };
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "reminders" && (
          <div className="space-y-4">
            <HealthSection
              title="Новое напоминание"
              onSubmit={(fd) => {
                startTransition(async () => {
                  const r = await createReminder(pet.id, fd);
                  if (r.ok) toast.success("Создано");
                  else toast.error(r.error);
                });
              }}
            >
              <select name="type" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" defaultValue="VACCINATION">
                <option value="VACCINATION">Прививка</option>
                <option value="DEWORMING">Дегельминтизация</option>
                <option value="GROOMING">Груминг</option>
                <option value="VET_VISIT">Визит к вету</option>
                <option value="MEDICATION">Лекарство</option>
                <option value="CUSTOM">Другое</option>
              </select>
              <input name="title" placeholder="Название" required className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
              <input name="dueAt" type="datetime-local" required className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
              <input name="repeatDays" type="number" placeholder="Повтор каждые N дней" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
            </HealthSection>
            <ul className="space-y-2">
              {pet.reminders.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-stone-100 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-stone-900">{r.title}</p>
                    <p className="text-xs text-stone-500">
                      {r.dueAt.toLocaleString("ru-RU")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await updateReminderStatus(r.id, "DONE");
                          toast.success("Готово");
                          router.refresh();
                        })
                      }
                    >
                      ✓
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await updateReminderStatus(r.id, "SKIPPED");
                          toast.success("Пропущено");
                          router.refresh();
                        })
                      }
                    >
                      Пропустить
                    </Button>
                    <HealthRecordActions
                      onDelete={async () => {
                        const res = await deleteReminder(r.id);
                        return { ok: res.ok, error: res.ok ? undefined : res.error };
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "weight" && (
          <div className="space-y-4">
            <WeightChart logs={pet.weightLogs} />
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const kg = parseFloat(
                  new FormData(e.currentTarget).get("kg") as string
                );
                startTransition(async () => {
                  const r = await addWeightLog(pet.id, kg);
                  if (r.ok) toast.success("Вес записан");
                  else toast.error(r.error);
                });
              }}
            >
              <input
                name="kg"
                type="number"
                step="0.1"
                placeholder="Вес, кг"
                required
                className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm"
              />
              <Button type="submit" disabled={pending}>
                Добавить
              </Button>
            </form>
            <ul className="space-y-1">
              {pet.weightLogs.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between text-sm text-stone-700"
                >
                  <span>{w.date.toLocaleDateString("ru-RU")}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{w.kg} кг</span>
                    <HealthRecordActions
                      onDelete={async () => {
                        const r = await deleteWeightLog(w.id);
                        return { ok: r.ok, error: r.ok ? undefined : r.error };
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Числовой показатель в шапке паспорта питомца
 */
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-stone-50 py-3 text-center">
      <p className="text-xl font-bold text-emerald-700">{value}</p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  );
}

/**
 * Блок медкарты: прививки, обработки, визиты
 */
function HealthSection({
  title,
  children,
  onSubmit,
}: {
  title: string;
  children: React.ReactNode;
  onSubmit: (fd: FormData) => void;
}) {
  return (
    <form
      className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
        e.currentTarget.reset();
      }}
    >
      <p className="mb-3 text-sm font-semibold text-stone-800">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
      <Button type="submit" className="mt-3">
        Добавить
      </Button>
    </form>
  );
}
