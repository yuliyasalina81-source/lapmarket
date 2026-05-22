import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPetById } from "@/lib/queries/pets";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const pet = await getPetById(id, session.user.id);
  if (!pet) return new NextResponse("Not found", { status: 404 });

  const vaccinations = pet.vaccinations
    .map(
      (v) =>
        `<tr><td>${v.name}</td><td>${v.date.toLocaleDateString("ru-RU")}</td><td>${v.clinic ?? ""}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><title>Паспорт ${pet.name}</title>
<style>body{font-family:system-ui,sans-serif;padding:2rem;max-width:800px;margin:0 auto}h1{color:#059669}table{width:100%;border-collapse:collapse;margin-top:1rem}td,th{border:1px solid #e7e5e4;padding:8px;text-align:left}</style>
</head>
<body>
<h1>🐾 Паспорт: ${pet.name}</h1>
<p>ЛапМаркет · ${new Date().toLocaleDateString("ru-RU")}</p>
${pet.microchip ? `<p><strong>Чип:</strong> ${pet.microchip}</p>` : ""}
${pet.weightKg ? `<p><strong>Вес:</strong> ${pet.weightKg} кг</p>` : ""}
<h2>Прививки</h2>
<table><thead><tr><th>Название</th><th>Дата</th><th>Клиника</th></tr></thead><tbody>${vaccinations || "<tr><td colspan=3>Нет записей</td></tr>"}</tbody></table>
<script>window.print()</script>
</body></html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
