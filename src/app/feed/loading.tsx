import { SkeletonGrid } from "@/components/ui/skeleton";

export default function FeedLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-stone-200" />
      <div className="mt-8">
        <SkeletonGrid count={3} />
      </div>
    </div>
  );
}
