import { redirect } from "next/navigation";

/** Alias for /services/[id] */
export default async function SpecialistAliasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/services/${id}`);
}
