import Link from "next/link";
import { PawPrint } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <PawPrint className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-stone-900">Страница не найдена</h1>
      <p className="mt-2 text-stone-600">
        Возможно, ссылка устарела или страница была удалена.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        На главную
      </Link>
    </div>
  );
}
