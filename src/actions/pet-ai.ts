/** Server Actions для AI-советов по питомцам */
"use server";

import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";

export type TipsResult =
  | { ok: true; tips: string }
  | { ok: false; error: string };

const kindLabels: Record<string, string> = {
  DOG: "собака",
  CAT: "кошка",
  BIRD: "птица",
  RODENT: "грызун",
  OTHER: "питомец",
};

function buildOfflineTips(pet: {
  name: string;
  kind: string;
  breed: string | null;
  weightKg: number | null;
  vaccinations: { name: string; nextDueAt: Date | null }[];
  reminders: { title: string; dueAt: Date }[];
}): string {
  const lines: string[] = [
    `Для ${pet.name} (${kindLabels[pet.kind] ?? pet.kind}${pet.breed ? `, ${pet.breed}` : ""}):`,
    "",
    "• Регулярно обновляйте вес и отмечайте прививки в паспорте — так проще заметить изменения здоровья.",
  ];
  if (pet.weightKg) {
    lines.push(`• Текущий вес ${pet.weightKg} кг — обсудите норму кормления с ветеринаром.`);
  }
  const dueVax = pet.vaccinations.filter((v) => v.nextDueAt && v.nextDueAt > new Date());
  if (dueVax.length > 0) {
    lines.push(`• Запланированы прививки: ${dueVax.map((v) => v.name).join(", ")}.`);
  }
  if (pet.reminders.length > 0) {
    lines.push(
      `• Ближайшие напоминания: ${pet.reminders.map((r) => r.title).join(", ")}.`
    );
  }
  lines.push(
    "",
    "Это справочные советы. При тревожных симптомах обращайтесь к ветеринару."
  );
  return lines.join("\n");
}

/**
 * Возвращает советы по уходу: OpenAI или офлайн-шаблон без ключа.
 * @param petId — идентификатор питомца владельца
 * @returns TipsResult с полем tips
 */
export async function getPetAiTips(petId: string): Promise<TipsResult> {
  try {
    const user = await requireSessionUser();
    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId: user.id },
      include: {
        vaccinations: { take: 5, orderBy: { date: "desc" } },
        reminders: {
          where: { status: "PENDING" },
          orderBy: { dueAt: "asc" },
          take: 3,
        },
      },
    });
    if (!pet) return { ok: false, error: "Питомец не найден" };

    const apiKey = process.env.OPENAI_API_KEY;
    // Без OPENAI_API_KEY — статические советы
    if (!apiKey) {
      return { ok: true, tips: buildOfflineTips(pet) };
    }

    const prompt = `Ты ветеринар-консультант. Дай 4–5 коротких практичных совета на русском для владельца.
Питомец: ${pet.name}, вид ${pet.kind}${pet.breed ? `, порода ${pet.breed}` : ""}${pet.weightKg ? `, вес ${pet.weightKg} кг` : ""}.
Прививки: ${pet.vaccinations.map((v) => v.name).join(", ") || "нет данных"}.
Без диагнозов, без назначения лекарств. Тон дружелюбный.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      }),
    });

    // При ошибке API — fallback на офлайн
    if (!res.ok) {
      return { ok: true, tips: buildOfflineTips(pet) };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return { ok: true, tips: text || buildOfflineTips(pet) };
  } catch {
    return { ok: false, error: "Не удалось получить советы" };
  }
}
