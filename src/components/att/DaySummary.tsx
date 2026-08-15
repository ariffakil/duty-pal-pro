import { CheckCircle2, Clock, LogOut, MapPin, Timer } from "lucide-react";

type Props = {
  clockIn: string;
  clockOut: string;
  totalWorked: string;
  lateMinutes: number;
  overtime: string;
  onDone: () => void;
};

export function DaySummary({
  clockIn,
  clockOut,
  totalWorked,
  lateMinutes,
  overtime,
  onDone,
}: Props) {
  const onTime = lateMinutes <= 0;

  return (
    <div className="px-6 pb-8 pt-6">
      <div className="surface-card relative overflow-hidden p-6 text-center">
        <div className="absolute inset-x-0 top-0 h-32 halo" />
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="h-9 w-9 text-success" />
        </div>
        <h2 className="relative mt-4 font-display text-2xl font-bold tracking-tight">
          Summary for the day
        </h2>
        <p className="relative mt-2 text-sm text-muted-foreground">
          You have successfully clocked out at{" "}
          <span className="font-semibold text-foreground">{clockOut}</span>
        </p>

        <div className="relative mt-5 flex items-center justify-center gap-2 rounded-xl bg-secondary/60 px-4 py-3 text-sm">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Karama, Dubai · Head Office</span>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Clock in
            </p>
            <p className="mt-1 font-display text-lg font-bold">{clockIn}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <LogOut className="h-3.5 w-3.5" /> Clock out
            </p>
            <p className="mt-1 font-display text-lg font-bold">{clockOut}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <Timer className="h-3.5 w-3.5" /> Total worked
            </p>
            <p className="mt-1 font-display text-lg font-bold text-primary">{totalWorked}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Overtime</p>
            <p className="mt-1 font-display text-lg font-bold">{overtime}</p>
          </div>
        </div>

        <div
          className={`relative mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
            onTime ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
          }`}
        >
          {onTime ? "You were ON TIME today" : `Late by ${lateMinutes} min today`}
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
