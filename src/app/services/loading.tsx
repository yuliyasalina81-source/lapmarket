import { SkeletonGrid } from "@/components/ui/skeleton";

export default function ServicesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-10 w-56 animate-pulse rounded-lg bg-stone-200" />
      <div className="mt-8">
        <SkeletonGrid count={4} />
      </div>
    </div>
  );
}
