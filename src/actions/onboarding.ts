"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { createPet } from "@/actions/pets";
import { addVaccination } from "@/actions/health";
import { createReminder } from "@/actions/reminders";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function completeOnboarding(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    if (user.role !== "OWNER") {
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingDone: true },
      });
      redirect("/profile");
    }

    const petResult = await createPet(formData);
    if (!petResult.ok || !petResult.id) {
      return petResult;
    }

    const vaccName = (formData.get("vaccName") as string)?.trim();
    const vaccDate = formData.get("vaccDate") as string;
    if (vaccName && vaccDate) {
      const vf = new FormData();
      vf.set("name", vaccName);
      vf.set("date", vaccDate);
      await addVaccination(petResult.id, vf);
    }

    const reminderTitle = (formData.get("reminderTitle") as string)?.trim();
    const reminderDue = formData.get("reminderDue") as string;
    if (reminderTitle && reminderDue) {
      const rf = new FormData();
      rf.set("type", "CUSTOM");
      rf.set("title", reminderTitle);
      rf.set("dueAt", reminderDue);
      await createReminder(petResult.id, rf);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingDone: true },
    });

    revalidatePath("/profile");
    redirect(`/pets/${petResult.id}`);
  } catch (e) {
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { ok: false, error: "Ошибка onboarding" };
  }
}
