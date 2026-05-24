export type AvailabilityRule = {
  weekday: number;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
};

export type TimeSlot = {
  iso: string;
  label: string;
};

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function generateDaySlots(
  date: Date,
  rules: AvailabilityRule[],
  durationMinutes: number,
  bookedIsoTimes: string[]
): TimeSlot[] {
  const weekday = date.getDay();
  const dayRules = rules.filter((r) => r.weekday === weekday);
  if (dayRules.length === 0) return [];

  const bookedSet = new Set(
    bookedIsoTimes.map((iso) => new Date(iso).toISOString())
  );
  const slots: TimeSlot[] = [];

  for (const rule of dayRules) {
    let cursor = parseTimeToMinutes(rule.start_time);
    const end = parseTimeToMinutes(rule.end_time);
    const breakStart = rule.break_start
      ? parseTimeToMinutes(rule.break_start)
      : null;
    const breakEnd = rule.break_end ? parseTimeToMinutes(rule.break_end) : null;

    while (cursor + durationMinutes <= end) {
      if (
        breakStart != null &&
        breakEnd != null &&
        cursor >= breakStart &&
        cursor < breakEnd
      ) {
        cursor = breakEnd;
        continue;
      }

      const slotDate = new Date(date);
      slotDate.setHours(Math.floor(cursor / 60), cursor % 60, 0, 0);
      const iso = slotDate.toISOString();

      if (!bookedSet.has(iso) && slotDate.getTime() > Date.now()) {
        slots.push({
          iso,
          label: slotDate.toLocaleString("ru-RU", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }
      cursor += durationMinutes;
    }
  }

  return slots;
}
