/**
 * One-time migration: Prisma ServiceProvider → Supabase specialist_profiles
 * Run: npx tsx scripts/migrate-providers-to-supabase.ts
 */
import { PrismaClient, ServiceKind } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

function kindToSupabase(kind: ServiceKind): "vet" | "groomer" {
  return kind === "VETERINARY" ? "vet" : "groomer";
}

async function main() {
  const providers = await prisma.serviceProvider.findMany({
    include: { user: true },
  });

  for (const p of providers) {
    await supabase.from("profiles").upsert({
      user_id: p.userId,
      role: "specialist",
      full_name: p.name,
      city: p.city,
      avatar_url: null,
    });

    const { data: existing } = await supabase
      .from("specialist_profiles")
      .select("id")
      .eq("user_id", p.userId)
      .maybeSingle();

    if (existing) {
      console.log("Skip existing", p.name);
      continue;
    }

    const { data: sp, error } = await supabase
      .from("specialist_profiles")
      .insert({
        user_id: p.userId,
        kind: kindToSupabase(p.kind),
        address: p.address,
        verification_status: p.verified ? "approved" : "pending",
        rating: p.rating,
        review_count: p.reviewCount,
        specialties: p.specialties,
      })
      .select("id")
      .single();

    if (error) {
      console.error(p.name, error.message);
      continue;
    }

    await supabase.from("services").insert({
      specialist_id: sp.id,
      name: p.kind === "VETERINARY" ? "Приём" : "Стрижка",
      duration_minutes: 60,
      price: p.priceFrom,
      description: p.specialties.join(", "),
    });

    for (let weekday = 1; weekday <= 5; weekday++) {
      await supabase.from("availability_rules").insert({
        specialist_id: sp.id,
        weekday,
        start_time: "10:00",
        end_time: "18:00",
        break_start: "13:00",
        break_end: "14:00",
      });
    }

    console.log("Migrated", p.name);
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
