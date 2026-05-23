"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function HealthRecordActions({
  onDelete,
  deleteLabel = "Удалить",
}: {
  onDelete: () => Promise<{ ok: boolean; error?: string }>;
  deleteLabel?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Удалить запись?")) return;
        startTransition(async () => {
          const result = await onDelete();
          if (result.ok) {
            toast.success("Удалено");
            router.refresh();
          } else toast.error(result.error ?? "Ошибка");
        });
      }}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      {deleteLabel}
    </button>
  );
}
