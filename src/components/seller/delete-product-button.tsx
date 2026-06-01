"use client";

/** Client Component */
/** Удаление товара продавцом */

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProduct } from "@/actions/products";

/**
 * Кнопка удаления товара с подтверждением
 */
export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Удалить товар? Он будет перемещён в архив.")) return;
        startTransition(async () => {
          const result = await deleteProduct(productId);
          if (result.ok) {
            toast.success("Товар удалён");
            router.refresh();
          } else toast.error(result.error);
        });
      }}
      className="self-center text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Удалить
    </button>
  );
}
