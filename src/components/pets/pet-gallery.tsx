"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/components/ui/product-image";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { ImageUpload } from "@/components/ui/image-upload";
import { addPetGalleryPhoto, removePetGalleryPhoto } from "@/actions/pet-media";

type GalleryItem = {
  id: string;
  media: { url: string };
};

export function PetGallery({
  petId,
  items,
}: {
  petId: string;
  items: GalleryItem[];
}) {
  const router = useRouter();
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const upload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addPetGalleryPhoto(petId, formData);
      if (result.ok) {
        toast.success("Фото добавлено");
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else toast.error(result.error);
    });
  };

  const remove = (petMediaId: string) => {
    startTransition(async () => {
      const result = await removePetGalleryPhoto(petId, petMediaId);
      if (result.ok) {
        toast.success("Удалено");
        router.refresh();
      } else toast.error(result.error);
    });
  };

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-stone-900">Галерея</h2>
      <form onSubmit={upload} className="mt-3 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <ImageUpload name="mediaId" folder="pets" label="Добавить в галерею" />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "Загрузка..." : "Загрузить"}
        </button>
      </form>
      {items.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="group relative">
              <button
                type="button"
                onClick={() => setLightboxUrl(item.media.url)}
                className="relative block aspect-square w-full overflow-hidden rounded-2xl"
              >
                <ProductImage
                  src={item.media.url}
                  alt=""
                  fill
                  className="rounded-2xl transition group-hover:scale-105"
                />
              </button>
              <button
                type="button"
                onClick={() => remove(item.id)}
                disabled={pending}
                className="absolute right-2 top-2 rounded-lg bg-black/50 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Удалить"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-stone-500">Пока нет фото в галерее</p>
      )}
      <ImageLightbox
        src={lightboxUrl ?? ""}
        alt="Фото питомца"
        open={!!lightboxUrl}
        onClose={() => setLightboxUrl(null)}
      />
    </section>
  );
}
