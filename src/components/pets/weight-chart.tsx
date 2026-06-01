"use client";

/** Client Component */
/** График веса питомца */

type WeightPoint = { date: Date; kg: number };

/**
 * Диаграмма динамики веса по журналу
 */
export function WeightChart({ logs }: { logs: WeightPoint[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-stone-500">Нет данных для графика</p>;
  }

  const sorted = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const values = sorted.map((l) => l.kg);
  const min = Math.min(...values) * 0.95;
  const max = Math.max(...values) * 1.05;
  const range = max - min || 1;
  const w = 320;
  const h = 120;
  const pad = 8;

  const points = sorted
    .map((l, i) => {
      const x = pad + (i / Math.max(sorted.length - 1, 1)) * (w - pad * 2);
      const y = h - pad - ((l.kg - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4">
      <p className="mb-2 text-sm font-medium text-stone-700">Динамика веса</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-md" role="img">
        <polyline
          fill="none"
          stroke="#059669"
          strokeWidth="2"
          strokeLinejoin="round"
          points={points}
        />
        {sorted.map((l, i) => {
          const x = pad + (i / Math.max(sorted.length - 1, 1)) * (w - pad * 2);
          const y = h - pad - ((l.kg - min) / range) * (h - pad * 2);
          return <circle key={l.date.toString() + i} cx={x} cy={y} r="3" fill="#059669" />;
        })}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-stone-500">
        <span>{sorted[0].kg} кг</span>
        <span>{sorted[sorted.length - 1].kg} кг (последний)</span>
      </div>
    </div>
  );
}
