/**
 * Smart-watch style reminder engine.
 *
 * Rules are evaluated once a minute against the employee's schedule and the
 * live shift state. Each rule fires at most once per day (per employee, per
 * device) except recurring ones like the stand-up nudge.
 */

export type ReminderTone = "info" | "nudge" | "cheer";

export type ReminderContext = {
  now: Date;
  employeeName: string;
  branch: string;
  /** Shift start in minutes from midnight. */
  startMin: number;
  /** Shift end in minutes from midnight. */
  endMin: number;
  clockInAt: Date | null;
  clockedOut: boolean;
};

export type Reminder = {
  id: string;
  tone: ReminderTone;
  text: string;
};

export type ReminderRule = {
  id: string;
  tone: ReminderTone;
  /** Repeat every N minutes instead of firing once a day. */
  repeatEveryMin?: number;
  when: (c: ReminderContext) => boolean;
  text: (c: ReminderContext) => string;
};

const hhmm = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes();

/** True when `now` is within `window` minutes after `target`. */
const at = (c: ReminderContext, target: number, window = 1) => {
  const m = minutesOf(c.now);
  return m >= target && m < target + window;
};

export const REMINDER_RULES: ReminderRule[] = [
  {
    id: "good-morning",
    tone: "info",
    when: (c) => c.now.getHours() >= 6 && c.now.getHours() < 10 && !c.clockInAt,
    text: (c) =>
      `Good morning ${c.employeeName}. Your duty hours today are ${hhmm(c.startMin)} to ${hhmm(
        c.endMin,
      )} at ${c.branch}.`,
  },
  {
    id: "duty-start-30",
    tone: "nudge",
    when: (c) => !c.clockInAt && at(c, c.startMin - 30, 5),
    text: (c) => `Your duty starts in 30 minutes at ${c.branch}. Time to head in.`,
  },
  {
    id: "duty-start-10",
    tone: "nudge",
    when: (c) => !c.clockInAt && at(c, c.startMin - 10, 3),
    text: () => "Only 10 minutes remaining to clock in. Touch the clock when you arrive.",
  },
  {
    id: "duty-started",
    tone: "nudge",
    when: (c) => !c.clockInAt && at(c, c.startMin, 5),
    text: (c) => `Your duty time has started at ${hhmm(c.startMin)}. Please clock in now.`,
  },
  {
    id: "stand-up",
    tone: "nudge",
    repeatEveryMin: 50,
    when: (c) => !!c.clockInAt && !c.clockedOut,
    text: () => "You have been seated for 50 minutes. Stand up and stretch for 2 minutes.",
  },
  {
    id: "hydrate",
    tone: "info",
    repeatEveryMin: 120,
    when: (c) => !!c.clockInAt && !c.clockedOut,
    text: () => "Hydration check — take a short water break.",
  },
  {
    id: "break-time",
    tone: "info",
    when: (c) => !!c.clockInAt && !c.clockedOut && at(c, Math.round((c.startMin + c.endMin) / 2), 5),
    text: () => "You are halfway through your shift. A short break is due.",
  },
  {
    id: "duty-end-30",
    tone: "info",
    when: (c) => !!c.clockInAt && !c.clockedOut && at(c, c.endMin - 30, 5),
    text: () => "Good evening. Your duty ends in 00:30 minutes. Please start wrapping up.",
  },
  {
    id: "duty-end",
    tone: "nudge",
    when: (c) => !!c.clockInAt && !c.clockedOut && at(c, c.endMin, 5),
    text: (c) => `Your duty time is complete at ${hhmm(c.endMin)}. Touch the clock to clock out.`,
  },
  {
    id: "good-evening",
    tone: "cheer",
    when: (c) => c.clockedOut && at(c, c.endMin + 5, 60),
    text: (c) => `Good evening ${c.employeeName}. Have a restful evening — well done today.`,
  },
  {
    id: "tomorrow-duty",
    tone: "info",
    when: (c) => c.now.getHours() === 21,
    text: (c) =>
      `Tomorrow your duty time is ${hhmm(c.startMin)} to ${hhmm(c.endMin)} at ${c.branch}. Good night.`,
  },
];

const key = (employeeId: string, id: string) => `nova.reminder.${employeeId}.${id}`;

function read(k: string): string | null {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}

function write(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* storage unavailable */
  }
}

/** Returns the reminders that should fire right now, marking them as sent. */
export function dueReminders(employeeId: string, c: ReminderContext): Reminder[] {
  const out: Reminder[] = [];
  const today = c.now.toDateString();

  for (const rule of REMINDER_RULES) {
    if (!rule.when(c)) continue;
    const k = key(employeeId, rule.id);
    const last = read(k);

    if (rule.repeatEveryMin) {
      const lastAt = last ? Number(last) : 0;
      if (c.now.getTime() - lastAt < rule.repeatEveryMin * 60_000) continue;
      write(k, String(c.now.getTime()));
    } else {
      if (last === today) continue;
      write(k, today);
    }

    out.push({ id: rule.id, tone: rule.tone, text: rule.text(c) });
  }

  return out;
}
