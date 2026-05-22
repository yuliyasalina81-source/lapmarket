"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-stone-900">Что-то пошло не так</h1>
      <p className="mt-2 text-stone-600">
        Попробуйте обновить страницу или вернитесь позже.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          Повторить
        </Button>
        <Button variant="secondary" type="button" onClick={() => (window.location.href = "/")}>
          На главную
        </Button>
      </div>
    </div>
  );
}
