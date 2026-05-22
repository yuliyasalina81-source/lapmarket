import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { getUserProfile } from "@/lib/user";

import { getUpcomingReminders } from "@/lib/queries/pets";

import { prisma } from "@/lib/prisma";

import { ProfileView } from "@/components/profile/profile-view";



export const metadata = {

  title: "Профиль — ЛапМаркет",

};



export default async function ProfilePage() {

  const session = await auth();

  if (!session?.user?.id) {

    redirect("/login");

  }



  const data = await getUserProfile(session.user.id);

  if (!data) {

    redirect("/login");

  }



  const { user, stats } = data;



  if (user.role === "OWNER" && !user.onboardingDone) {

    redirect("/onboarding");

  }



  const [reminders, hasProvider] = await Promise.all([

    user.role === "OWNER" ? getUpcomingReminders(session.user.id) : [],

    prisma.serviceProvider.findFirst({

      where: { userId: session.user.id },

      select: { id: true },

    }),

  ]);



  return (

    <ProfileView

      user={{

        id: user.id,

        displayName: user.displayName,

        email: user.email ?? "",

        avatar: user.avatar,

        city: user.city,

        role: user.role,

        pets: user.pets,

        sellerProfile: user.sellerProfile,

        shelterProfile: user.shelterProfile,

      }}

      stats={stats}

      reminders={reminders}

      hasProvider={!!hasProvider}

    />

  );

}

