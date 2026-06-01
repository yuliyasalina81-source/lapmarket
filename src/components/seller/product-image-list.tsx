"use client";

/** Client Component */
/** Управление галереей фото товара */

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { removeProductImage } from "@/actions/products";
import { ProductImage } from "@/components/ui/product-image";

/**
 * Список изображений товара с удалением
 */
export function ProductImageList({
  images,
}: {
  images: { id: string; media: { url: string } }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (images.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-medium text-stone-700">Текущие фото</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {images.map((img) => (
          <div key={img.id} className="relative">
            <div className="relative h-20 w-20 overflow-hidden rounded-lg">
              <ProductImage src={img.media.url} alt="" fill />
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await removeProductImage(img.id);
                  if (result.ok) {
                    toast.success("Фото удалено");
                    router.refresh();
                  } else toast.error(result.error);
                })
              }
              className="mt-1 w-full text-xs text-red-600 hover:underline"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
