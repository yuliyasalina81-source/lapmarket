"use client";

import { motion } from "framer-motion";

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="overflow-hidden rounded-2xl border border-stone-100 bg-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.08 }}
        >
          <div className="skeleton h-36" />
          <div className="space-y-3 p-4">
            <div className="skeleton h-3 w-1/3 rounded-full" />
            <div className="skeleton h-4 w-4/5 rounded-full" />
            <div className="skeleton h-4 w-2/3 rounded-full" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
