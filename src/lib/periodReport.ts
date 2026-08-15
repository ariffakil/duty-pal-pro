import type { PeriodDay } from "@/components/att/PeriodSummary";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHIFT_START_MIN = 8 * 60 + 30;

const pad = (n: number) => String(n).padStart(2, "0");
const fmtMin = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const dateKey = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;

/** Deterministic pseudo-random so the report is stable per date. */
function seeded(d: Date) {
  const s = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return ((s * 9301 + 49297) % 233280) / 233280;
}

function buildDay(d: Date, today?: { in: string; out: string; hours: number; late: number }): PeriodDay {
  const weekend = d.getDay() === 0 || d.getDay() === 6;
  const base: PeriodDay = {
    label: DAY_NAMES[d.getDay()] ?? "",
    date: dateKey(d),
    in: "--:--",
    out: "--:--",
    hours: 0,
    late: 0,
    status: weekend ? "off" : "present",
  };
  if (weekend) return base;
  if (today) return { ...base, ...today, status: "present" };

  const r = seeded(d);
  if (r > 0.94) return { ...base, status: "absent" };
  const late = r > 0.72 ? Math.round(r * 25) : 0;
  const inMin = SHIFT_START_MIN + late;
  const hours = 9 + (r > 0.85 ? Math.round(r * 10) / 10 : 0);
  return {
    ...base,
    in: fmtMin(inMin),
    out: fmtMin(inMin + Math.round(hours * 60)),
    hours,
    late,
  };
}

export function isLastPunchOfWeek(d: Date) {
  return d.getDay() === 5; // Friday = last working day
}

export function isLastPunchOfMonth(d: Date) {
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  if (next.getMonth() !== d.getMonth()) return true;
  // Last working day of the month (if month ends on the weekend).
  for (let i = 1; i <= 2; i++) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    if (x.getMonth() !== d.getMonth()) return true;
    if (x.getDay() !== 0 && x.getDay() !== 6) return false;
  }
  return false;
}

type Today = { in: string; out: string; hours: number; late: number };

export function buildWeekReport(ref: Date, today: Today) {
  const start = new Date(ref);
  start.setDate(ref.getDate() - ((ref.getDay() + 6) % 7)); // Monday
  const days: PeriodDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const isToday = d.toDateString() === ref.toDateString();
    if (d > ref && !isToday) break;
    days.push(buildDay(d, isToday ? today : undefined));
  }
  const end = days.length ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + days.length - 1) : ref;
  return {
    days,
    range: `${dateKey(start)} — ${dateKey(end)} · Karama Branch`,
  };
}

export function buildMonthReport(ref: Date, today: Today) {
  const days: PeriodDay[] = [];
  for (let i = 1; i <= ref.getDate(); i++) {
    const d = new Date(ref.getFullYear(), ref.getMonth(), i);
    days.push(buildDay(d, i === ref.getDate() ? today : undefined));
  }
  return {
    days,
    range: `${ref.toLocaleDateString(undefined, { month: "long", year: "numeric" })} · Karama Branch`,
  };
}
