/**
 * Duty roster: the employee's real weekly schedule, resolved per calendar day.
 * Used by the clock ring to draw the duty window for today (or tomorrow once
 * today's shift is over / today is a day off).
 */

export type DutyWindow = { startMin: number; endMin: number };

/** Sunday = 0 … Saturday = 6. `null` = day off. */
const WEEK: Record<number, DutyWindow | null> = {
  0: { startMin: 8 * 60 + 30, endMin: 18 * 60 }, // Sun
  1: { startMin: 8 * 60 + 30, endMin: 18 * 60 },
  2: { startMin: 8 * 60 + 30, endMin: 18 * 60 },
  3: { startMin: 8 * 60 + 30, endMin: 18 * 60 },
  4: { startMin: 8 * 60 + 30, endMin: 18 * 60 },
  5: { startMin: 9 * 60, endMin: 14 * 60 }, // Fri — short day
  6: null, // Sat — off
};

export const dutyFor = (date: Date): DutyWindow | null => WEEK[date.getDay()] ?? null;

export type DutyPhase = "before" | "active" | "tomorrow" | "off";

export type ResolvedDuty = {
  window: DutyWindow | null;
  phase: DutyPhase;
  /** true when `window` belongs to the next calendar day. */
  isTomorrow: boolean;
};

/**
 * Picks the duty window that matters right now: today's while it is upcoming
 * or running, otherwise tomorrow's.
 */
export function resolveDuty(now: Date = new Date()): ResolvedDuty {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const today = dutyFor(now);

  if (today && nowMin < today.endMin) {
    return {
      window: today,
      phase: nowMin >= today.startMin ? "active" : "before",
      isTomorrow: false,
    };
  }

  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  const tomorrow = dutyFor(next);

  return {
    window: tomorrow,
    phase: tomorrow ? "tomorrow" : "off",
    isTomorrow: true,
  };
}

/** Gradient stops per phase — keeps the ring colour meaningful at a glance. */
export const dutyGradient = (phase: DutyPhase): [string, string] => {
  switch (phase) {
    case "active":
      return ["var(--color-success)", "var(--color-accent)"];
    case "before":
      return ["var(--color-primary)", "var(--color-accent)"];
    case "tomorrow":
      return ["var(--color-accent)", "var(--color-primary)"];
    default:
      return ["var(--color-muted-foreground)", "var(--color-muted-foreground)"];
  }
};

export const fmtMin = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
