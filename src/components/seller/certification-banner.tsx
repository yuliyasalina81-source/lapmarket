"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { requestCertification } from "@/actions/products";

export function CertificationBanner() {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      const result = await requestCertification(note);
      if (result.ok) toast.success("Заявка на сертификацию отправлена");
      else toast.error(result.error);
    });
  };

  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="font-semibold text-amber-900">Ожидается сертификация</p>
      <p className="mt-1 text-sm text-amber-800">
        Только сертифицированные продавцы могут публиковать товары в каталоге
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Комментарий к заявке (необязательно)"
        rows={2}
        className="mt-3 w-full rounded-xl border border-amber-200 px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="mt-3 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? "Отправка..." : "Подать заявку на сертификацию"}
      </button>
    </div>
  );
}
