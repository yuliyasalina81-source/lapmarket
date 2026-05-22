import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata = { title: "Настройки — ЛапМаркет" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { pets: true },
  });
  if (!user) redirect("/login");

  return (
    <SettingsForm
      user={{
        displayName: user.displayName,
        city: user.city ?? "",
        avatar: user.avatar,
        role: user.role,
        pets: "",
      }}
    />
  );
}
