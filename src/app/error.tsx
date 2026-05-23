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
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:py-24">
      <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">
        Что-то пошло не так
      </h1>
      <p className="mt-2 text-sm text-stone-600 sm:text-base">
        Попробуйте обновить страницу. На телефоне помогает открыть сайт в
        обычном браузере (не из закладки «на экран») или очистить кэш.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:mt-8 sm:flex-row sm:gap-3">
        <Button type="button" onClick={() => reset()}>
          Повторить
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={() => window.location.reload()}
        >
          Обновить
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          На главную
        </Button>
      </div>
    </div>
  );
}
