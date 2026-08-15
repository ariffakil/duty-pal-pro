import { CalendarDays, Clock3, TrendingUp, AlertTriangle } from "lucide-react";

export type PeriodDay = {
  label: string;
  date: string;
  in: string;
  out: string;
  hours: number;
  late: number;
  status: "present" | "off" | "absent";
};

type Props = {
  scope: "week" | "month";
  title: string;
  range: string;
  days: PeriodDay[];
  onDone: () => void;
};

export function PeriodSummary({ scope, title, range, days, onDone }: Props) {
  const worked = days.filter((d) => d.status === "present");
  const totalHours = worked.reduce((s, d) => s + d.hours, 0);
  const lateDays = worked.filter((d) => d.late > 0).length;
  const totalLate = worked.reduce((s, d) => s + d.late, 0);
  const overtime = worked.reduce((s, d) => s + Math.max(0, d.hours - 9), 0);
  const absent = days.filter((d) => d.status === "absent").length;

  const hm = (h: number) =>
    `${String(Math.floor(h)).padStart(2, "0")}h ${String(Math.round((h % 1) * 60)).padStart(2, "0")}m`;

  return (
    <div className="px-6 pb-8 pt-6">
      <div className="surface-card relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-32 halo" />

        <div className="relative flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-aurora)" }}
          >
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
            <p className="text-xs text-muted-foreground">{range}</p>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" /> Total hours
            </p>
            <p className="mt-1 font-display text-lg font-bold text-primary">{hm(totalHours)}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Days present</p>
            <p className="mt-1 font-display text-lg font-bold">
              {worked.length}
              <span className="text-sm text-muted-foreground">/{days.filter((d) => d.status !== "off").length}</span>
            </p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> Overtime
            </p>
            <p className="mt-1 font-display text-lg font-bold">{hm(overtime)}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" /> Late
            </p>
            <p className="mt-1 font-display text-lg font-bold">
              {lateDays}d · {totalLate}m
            </p>
          </div>
        </div>

        <div className="relative mt-5 overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_0.9fr] bg-secondary/60 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>{scope === "week" ? "Day" : "Date"}</span>
            <span>In</span>
            <span>Out</span>
            <span className="text-right">Hrs</span>
          </div>
          <div className="max-h-56 overflow-y-auto no-scrollbar">
            {days.map((d) => (
              <div
                key={d.date}
                className="grid grid-cols-[1.2fr_1fr_1fr_0.9fr] items-center border-t border-border/60 px-3 py-2 text-xs"
              >
                <span className="font-medium">
                  {scope === "week" ? d.label : d.date}
                  {d.late > 0 && (
                    <span className="ml-1 text-[10px] font-bold text-warning">+{d.late}m</span>
                  )}
                </span>
                <span className="text-muted-foreground">{d.status === "present" ? d.in : "—"}</span>
                <span className="text-muted-foreground">{d.status === "present" ? d.out : "—"}</span>
                <span
                  className={`text-right font-semibold ${
                    d.status === "present"
                      ? "text-foreground"
                      : d.status === "absent"
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }`}
                >
                  {d.status === "present" ? d.hours.toFixed(1) : d.status === "absent" ? "ABS" : "OFF"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`relative mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
            absent === 0 && lateDays === 0
              ? "bg-success/15 text-success"
              : "bg-warning/15 text-warning"
          }`}
        >
          {absent === 0 && lateDays === 0
            ? `Perfect attendance this ${scope}. Well done!`
            : `${lateDays} late ${lateDays === 1 ? "day" : "days"}${absent ? ` · ${absent} absent` : ""} this ${scope}.`}
        </div>
      </div>

      <button
        onClick={onDone}
        className="mt-6 w-full rounded-2xl px-6 py-4 text-base font-semibold text-primary-foreground active:scale-[0.98]"
        style={{ backgroundImage: "var(--gradient-aurora)", boxShadow: "var(--shadow-glow)" }}
      >
        Back to home
      </button>
    </div>
  );
}
