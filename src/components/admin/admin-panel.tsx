"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  approveCertification,
  rejectCertification,
  updateUserRole,
  updateProductStatusAdmin,
  adminDeletePost,
  deleteProductReview,
  deleteServiceReview,
  toggleProviderVerified,
} from "@/actions/admin";
import { moderateListing } from "@/actions/animals";
import { ProductImage } from "@/components/ui/product-image";
import type {
  getPendingCertifications,
  getPendingListingsForAdmin,
  getAdminUsers,
  getAdminProducts,
  getAdminPosts,
  getAdminProductReviews,
  getAdminServiceReviews,
  getAdminServiceProviders,
} from "@/lib/queries/admin";
import type { ProductStatus, UserRole } from "@prisma/client";

type Tab = "certs" | "listings" | "users" | "products" | "posts" | "reviews" | "services";

export function AdminPanel({
  certifications,
  listings,
  users,
  products,
  posts,
  productReviews,
  serviceReviews,
  serviceProviders,
}: {
  certifications: Awaited<ReturnType<typeof getPendingCertifications>>;
  listings: Awaited<ReturnType<typeof getPendingListingsForAdmin>>;
  users: Awaited<ReturnType<typeof getAdminUsers>>;
  products: Awaited<ReturnType<typeof getAdminProducts>>;
  posts: Awaited<ReturnType<typeof getAdminPosts>>;
  productReviews: Awaited<ReturnType<typeof getAdminProductReviews>>;
  serviceReviews: Awaited<ReturnType<typeof getAdminServiceReviews>>;
  serviceProviders: Awaited<ReturnType<typeof getAdminServiceProviders>>;
}) {
  const [tab, setTab] = useState<Tab>("certs");
  const [pending, startTransition] = useTransition();

  const tabs: { id: Tab; label: string }[] = [
    { id: "certs", label: `Сертификация (${certifications.length})` },
    { id: "listings", label: `Объявления (${listings.length})` },
    { id: "users", label: "Пользователи" },
    { id: "products", label: "Товары" },
    { id: "posts", label: "Посты" },
    { id: "reviews", label: "Отзывы" },
    { id: "services", label: "Услуги" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">Панель администратора</h1>

      <nav className="mt-6 flex gap-1 overflow-x-auto rounded-2xl bg-stone-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium sm:text-sm ${
              tab === t.id ? "bg-white text-emerald-800 shadow-sm" : "text-stone-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "certs" && (
          <AdminList empty="Нет заявок">
            {certifications.map((c) => (
              <div key={c.id} className="rounded-2xl border bg-white p-4">
                <p className="font-semibold">{c.sellerProfile.shopName}</p>
                <p className="text-sm text-stone-600">
                  {c.sellerProfile.user.displayName} · {c.sellerProfile.user.email}
                </p>
                <div className="mt-3 flex gap-2">
                  <AdminBtn
                    pending={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const r = await approveCertification(c.id);
                        if (r.ok) toast.success("Одобрено");
                        else toast.error(r.error);
                      })
                    }
                    primary
                  >
                    Одобрить
                  </AdminBtn>
                  <AdminBtn
                    pending={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const r = await rejectCertification(c.id);
                        if (r.ok) toast.success("Отклонено");
                        else toast.error(r.error);
                      })
                    }
                  >
                    Отклонить
                  </AdminBtn>
                </div>
              </div>
            ))}
          </AdminList>
        )}

        {tab === "listings" && (
          <AdminList empty="Нет объявлений">
            {listings.map((l) => (
              <div key={l.id} className="flex gap-4 rounded-2xl border bg-white p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <ProductImage src={l.images[0]?.media.url ?? null} alt={l.name} fill />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{l.name}</p>
                  <p className="text-sm text-stone-500">{l.author.displayName}</p>
                  <div className="mt-3 flex gap-2">
                    <AdminBtn
                      pending={pending}
                      primary
                      onClick={() =>
                        startTransition(async () => {
                          const r = await moderateListing(l.id, "publish");
                          if (r.ok) toast.success("Опубликовано");
                          else toast.error(r.error);
                        })
                      }
                    >
                      Опубликовать
                    </AdminBtn>
                    <AdminBtn
                      pending={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const r = await moderateListing(l.id, "reject");
                          if (r.ok) toast.success("Отклонено");
                          else toast.error(r.error);
                        })
                      }
                    >
                      Отклонить
                    </AdminBtn>
                  </div>
                </div>
              </div>
            ))}
          </AdminList>
        )}

        {tab === "users" && (
          <AdminList empty="Нет пользователей">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-2xl border bg-white p-4">
                <div>
                  <p className="font-medium">{u.displayName}</p>
                  <p className="text-sm text-stone-500">{u.email}</p>
                </div>
                <select
                  defaultValue={u.role}
                  disabled={pending}
                  onChange={(e) =>
                    startTransition(async () => {
                      const r = await updateUserRole(u.id, e.target.value as UserRole);
                      if (r.ok) toast.success("Роль обновлена");
                      else toast.error(r.error);
                    })
                  }
                  className="rounded-lg border border-stone-200 px-2 py-1 text-sm"
                >
                  <option value="OWNER">Владелец</option>
                  <option value="SELLER">Продавец</option>
                  <option value="SHELTER">Приют</option>
                  <option value="ADMIN">Админ</option>
                </select>
              </div>
            ))}
          </AdminList>
        )}

        {tab === "products" && (
          <AdminList empty="Нет товаров">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl border bg-white p-4">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-stone-500">{p.seller.displayName}</p>
                </div>
                <select
                  defaultValue={p.status}
                  disabled={pending}
                  onChange={(e) =>
                    startTransition(async () => {
                      const r = await updateProductStatusAdmin(
                        p.id,
                        e.target.value as ProductStatus
                      );
                      if (r.ok) toast.success("Статус обновлён");
                      else toast.error(r.error);
                    })
                  }
                  className="rounded-lg border border-stone-200 px-2 py-1 text-sm"
                >
                  <option value="DRAFT">Черновик</option>
                  <option value="PUBLISHED">Опубликован</option>
                  <option value="ARCHIVED">Архив</option>
                </select>
              </div>
            ))}
          </AdminList>
        )}

        {tab === "posts" && (
          <AdminList empty="Нет постов">
            {posts.map((p) => (
              <div key={p.id} className="rounded-2xl border bg-white p-4">
                <p className="text-sm text-stone-500">{p.author.displayName}</p>
                <p className="mt-1 line-clamp-2 text-sm">{p.content}</p>
                <p className="mt-1 text-xs text-stone-400">
                  {p._count.likes} лайков · {p._count.comments} комментариев
                </p>
                <AdminBtn
                  pending={pending}
                  className="mt-2"
                  onClick={() =>
                    startTransition(async () => {
                      const r = await adminDeletePost(p.id);
                      if (r.ok) toast.success("Пост удалён");
                      else toast.error(r.error);
                    })
                  }
                >
                  Удалить пост
                </AdminBtn>
              </div>
            ))}
          </AdminList>
        )}

        {tab === "reviews" && (
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-stone-800">Отзывы на товары</h3>
              <AdminList empty="Нет отзывов" className="mt-3">
                {productReviews.map((r) => (
                  <div key={r.id} className="flex justify-between rounded-2xl border bg-white p-4 text-sm">
                    <span>
                      {r.product.title} — {r.user.displayName} ({r.rating}★)
                    </span>
                    <AdminBtn
                      pending={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const res = await deleteProductReview(r.id);
                          if (res.ok) toast.success("Удалено");
                          else toast.error(res.error);
                        })
                      }
                    >
                      Удалить
                    </AdminBtn>
                  </div>
                ))}
              </AdminList>
            </div>
            <div>
              <h3 className="font-semibold text-stone-800">Отзывы на услуги</h3>
              <AdminList empty="Нет отзывов" className="mt-3">
                {serviceReviews.map((r) => (
                  <div key={r.id} className="flex justify-between rounded-2xl border bg-white p-4 text-sm">
                    <span>
                      {r.provider.name} — {r.user.displayName} ({r.rating}★)
                    </span>
                    <AdminBtn
                      pending={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const res = await deleteServiceReview(r.id);
                          if (res.ok) toast.success("Удалено");
                          else toast.error(res.error);
                        })
                      }
                    >
                      Удалить
                    </AdminBtn>
                  </div>
                ))}
              </AdminList>
            </div>
          </div>
        )}

        {tab === "services" && (
          <AdminList empty="Нет провайдеров">
            {serviceProviders.map((sp) => (
              <div key={sp.id} className="flex items-center justify-between rounded-2xl border bg-white p-4">
                <div>
                  <p className="font-medium">{sp.name}</p>
                  <p className="text-sm text-stone-500">{sp.user.displayName}</p>
                </div>
                <AdminBtn
                  pending={pending}
                  primary={!sp.verified}
                  onClick={() =>
                    startTransition(async () => {
                      const r = await toggleProviderVerified(sp.id, !sp.verified);
                      if (r.ok) toast.success(sp.verified ? "Снята проверка" : "Проверен");
                      else toast.error(r.error);
                    })
                  }
                >
                  {sp.verified ? "Снять проверку" : "Проверить"}
                </AdminBtn>
              </div>
            ))}
          </AdminList>
        )}
      </div>
    </div>
  );
}

function AdminList({
  children,
  empty,
  className = "",
}: {
  children: React.ReactNode;
  empty: string;
  className?: string;
}) {
  const items = Array.isArray(children) ? children : [children];
  const hasContent = items.some((c) => c != null);
  return (
    <div className={`space-y-3 ${className}`}>
      {!hasContent ? <p className="text-sm text-stone-500">{empty}</p> : children}
    </div>
  );
}

function AdminBtn({
  children,
  onClick,
  pending,
  primary,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  pending: boolean;
  primary?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
        primary
          ? "bg-emerald-600 text-white"
          : "border border-stone-200 text-stone-700"
      } ${className}`}
    >
      {children}
    </button>
  );
}
