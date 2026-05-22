import Link from "next/link";
import { globalSearch } from "@/lib/queries/search";

export const metadata = { title: "Поиск — ЛапМаркет" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = await globalSearch(q);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">Поиск</h1>
      <form className="mt-6" action="/search" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Посты, товары, объявления, услуги..."
          className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm"
        />
      </form>

      {q.length >= 2 && (
        <div className="mt-10 space-y-8">
          {results.products.length > 0 && (
            <section>
              <h2 className="font-semibold text-stone-800">Товары</h2>
              <ul className="mt-3 space-y-2">
                {results.products.map((p) => (
                  <li key={p.id}>
                    <Link href={`/market/${p.id}`} className="text-emerald-700 hover:underline">
                      {p.title} — {p.price} ₽
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {results.listings.length > 0 && (
            <section>
              <h2 className="font-semibold text-stone-800">Объявления</h2>
              <ul className="mt-3 space-y-2">
                {results.listings.map((l) => (
                  <li key={l.id}>
                    <Link href={`/animals/${l.id}`} className="text-emerald-700 hover:underline">
                      {l.name} — {l.city}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {results.providers.length > 0 && (
            <section>
              <h2 className="font-semibold text-stone-800">Услуги</h2>
              <ul className="mt-3 space-y-2">
                {results.providers.map((p) => (
                  <li key={p.id}>
                    <Link href={`/services/${p.id}`} className="text-emerald-700 hover:underline">
                      {p.name} — {p.city}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {results.posts.length > 0 && (
            <section>
              <h2 className="font-semibold text-stone-800">Посты</h2>
              <ul className="mt-3 space-y-2">
                {results.posts.map((p) => (
                  <li key={p.id} className="text-sm text-stone-600 line-clamp-2">
                    {p.petName ? `${p.petName}: ` : ""}
                    {p.content}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {results.posts.length === 0 &&
            results.products.length === 0 &&
            results.listings.length === 0 &&
            results.providers.length === 0 && (
              <p className="text-stone-500">Ничего не найдено</p>
            )}
        </div>
      )}
    </div>
  );
}
