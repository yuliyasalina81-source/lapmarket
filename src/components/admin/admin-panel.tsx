"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  approveCertification,
  rejectCertification,
} from "@/actions/admin";
import { moderateListing } from "@/actions/animals";
import { ProductImage } from "@/components/ui/product-image";
import type { getPendingCertifications, getPendingListingsForAdmin } from "@/lib/queries/admin";

type Cert = Awaited<ReturnType<typeof getPendingCertifications>>[number];
type Listing = Awaited<ReturnType<typeof getPendingListingsForAdmin>>[number];

export function AdminPanel({
  certifications,
  listings,
}: {
  certifications: Cert[];
  listings: Listing[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">Панель администратора</h1>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-800">
          Сертификация продавцов ({certifications.length})
        </h2>
        <div className="mt-4 space-y-4">
          {certifications.length === 0 ? (
            <p className="text-sm text-stone-500">Нет заявок</p>
          ) : (
            certifications.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-stone-100 bg-white p-4"
              >
                <p className="font-semibold">{c.sellerProfile.shopName}</p>
                <p className="text-sm text-stone-600">
                  {c.sellerProfile.user.displayName} · {c.sellerProfile.user.email}
                </p>
                {c.note && <p className="mt-2 text-sm text-stone-500">{c.note}</p>}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const r = await approveCertification(c.id);
                        if (r.ok) toast.success("Продавец сертифицирован");
                        else toast.error(r.error);
                      })
                    }
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
                  >
                    Одобрить
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const r = await rejectCertification(c.id);
                        if (r.ok) toast.success("Заявка отклонена");
                        else toast.error(r.error);
                      })
                    }
                    className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-800">
          Объявления о питомцах ({listings.length})
        </h2>
        <div className="mt-4 space-y-4">
          {listings.length === 0 ? (
            <p className="text-sm text-stone-500">Нет объявлений на модерации</p>
          ) : (
            listings.map((l) => (
              <div
                key={l.id}
                className="flex gap-4 rounded-2xl border border-stone-100 bg-white p-4"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <ProductImage
                    src={l.images[0]?.media.url ?? null}
                    alt={l.name}
                    fill
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{l.name}</p>
                  <p className="text-sm text-stone-500">
                    {l.author.displayName} · {l.city}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                    {l.description}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const r = await moderateListing(l.id, "publish");
                          if (r.ok) toast.success("Опубликовано");
                          else toast.error(r.error);
                        })
                      }
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
                    >
                      Опубликовать
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const r = await moderateListing(l.id, "reject");
                          if (r.ok) toast.success("Отклонено");
                          else toast.error(r.error);
                        })
                      }
                      className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
