import { LogIn, LogOut, MapPin, Coffee, CalendarDays, Fingerprint } from "lucide-react";
import { FaceTouch } from "./FaceTouch";

type Props = {
  clockIn: string;
  clockOut: string;
  remaining: { h: number; m: number; s: number };
  percent: number;
  lateMinutes: number;
  onClockOut: () => void;
  clockedOut: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function ShiftDashboard({
  clockIn,
  clockOut,
  remaining,
  percent,
  lateMinutes,
  onClockOut,
  clockedOut,
}: Props) {
  const radius = 78;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="px-6 pb-6 pt-2">
      <div className="surface-card relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-28 halo" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Time remaining
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Until clock out · {clockOut}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              lateMinutes > 0 ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
            }`}
          >
            {lateMinutes > 0 ? `Late ${lateMinutes}m` : "On time"}
          </span>
        </div>

        <div className="relative mx-auto mt-5 flex h-48 w-48 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 192 192">
            <circle
              cx="96"
              cy="96"
              r={radius}
              fill="none"
              stroke="var(--color-secondary)"
              strokeWidth="10"
            />
            <circle
              cx="96"
              cy="96"
              r={radius}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - percent)}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div className="text-center">
            <p className="font-mono text-4xl font-semibold tabular-nums tracking-tight">
              {pad(remaining.h)}:{pad(remaining.m)}:{pad(remaining.s)}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {clockedOut ? "shift closed" : "hrs · min · sec"}
            </p>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <LogIn className="h-3.5 w-3.5 text-success" /> Clock in
            </p>
            <p className="mt-1 text-xl font-semibold">{clockIn}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <LogOut className="h-3.5 w-3.5 text-accent" /> Clock out
            </p>
            <p className="mt-1 text-xl font-semibold">{clockedOut ? clockOut : "--:--"}</p>
          </div>
        </div>

        <p className="relative mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" /> Karama, Dubai · Gate 2 reader
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { icon: Coffee, label: "Break" },
          { icon: CalendarDays, label: "Leave" },
          { icon: Fingerprint, label: "Access" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="surface-card flex flex-col items-center gap-2 px-2 py-4 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon className="h-5 w-5 text-primary" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center">
        {clockedOut ? (
          <p className="rounded-2xl bg-success/15 px-6 py-4 text-sm font-semibold text-success">
            Shift completed · Thank you
          </p>
        ) : (
          <FaceTouch
            status="idle"
            size={168}
            onTouch={onClockOut}
            label="Touch face to clock out"
          />
        )}
      </div>
    </div>
  );
}
