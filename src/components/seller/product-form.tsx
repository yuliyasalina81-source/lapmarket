"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/actions/products";
import { ImageUpload } from "@/components/ui/image-upload";
import { PRODUCT_CATEGORY_LABELS, PRODUCT_CATEGORIES } from "@/lib/constants";
import type { ProductCategory, ProductStatus } from "@prisma/client";

type ProductFormProps = {
  product?: {
    id: string;
    title: string;
    description: string;
    price: number;
    category: ProductCategory;
    status: ProductStatus;
  };
};

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = !!product;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);
      if (result.ok) {
        toast.success(isEdit ? "Товар обновлён" : "Товар создан");
        router.push("/seller/products");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <ImageUpload name="files" multiple maxFiles={5} label="Фото товара" />
      <Field label="Название" name="title" defaultValue={product?.title} required />
      <div>
        <label className="text-sm font-medium text-stone-700">Категория</label>
        <select
          name="category"
          defaultValue={product?.category ?? "FOOD"}
          className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        >
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {PRODUCT_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <Field label="Цена (₽)" name="price" type="number" defaultValue={product?.price} required />
      <div>
        <label className="text-sm font-medium text-stone-700">Статус</label>
        <select
          name="status"
          defaultValue={product?.status ?? "DRAFT"}
          className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        >
          <option value="DRAFT">Черновик</option>
          <option value="PUBLISHED">Опубликован</option>
          <option value="ARCHIVED">В архиве</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-stone-700">Описание</label>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={product?.description}
          className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Сохранение..." : isEdit ? "Сохранить" : "Создать товар"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  defaultValue?: string | number;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-stone-700">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
      />
    </div>
  );
}
