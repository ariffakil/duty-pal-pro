import { useState } from "react";
import { MapPin, Coffee, CalendarDays, Fingerprint, Phone } from "lucide-react";
import { FaceTouch } from "./FaceTouch";
import { AnalogClock } from "./AnalogClock";
import { IntercomCall } from "./IntercomCall";



type Props = {
  clockIn: string;
  clockOut: string;
  remaining: { h: number; m: number; s: number };
  percent: number;
  lateMinutes: number;
  onClockOut: () => void;
  clockedOut: boolean;
};

export function ShiftDashboard({
  clockIn,
  clockOut,
  lateMinutes,
  onClockOut,
  clockedOut,
}: Props) {
  const [intercomOpen, setIntercomOpen] = useState(false);

  return (
    <div className="px-6 pb-6 pt-2">

      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Today&apos;s duty
        </p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            lateMinutes > 0 ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
          }`}
        >
          {lateMinutes > 0 ? `Late ${lateMinutes}m` : "On time"}
        </span>
      </div>

      <div className="mt-5 flex flex-col items-center">
        {clockedOut ? (
          <p className="rounded-2xl bg-success/15 px-6 py-4 text-sm font-semibold text-success">
            Shift completed · Thank you
          </p>
        ) : (
          <FaceTouch
            status="idle"
            size={168}
            onTouch={onClockOut}
            action="Clock out"
            label="Touch face to clock out"
          />
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-secondary/30 p-4">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            <AnalogClock time={clockIn} tone="success" /> Clock in
          </p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{clockIn}</p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/30 p-4">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            <AnalogClock time={clockedOut ? clockOut : "--:--"} tone="accent" /> Clock out
          </p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-muted-foreground">
            {clockedOut ? clockOut : "--:--"}
          </p>
        </div>
      </div>


      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 text-primary" /> Karama, Dubai · Gate 2 reader
      </p>

      <div className="sticky bottom-0 z-20 mt-12 grid grid-cols-4 gap-2.5 border-t border-border/40 bg-background/85 py-3 backdrop-blur-xl">
        {[
          { icon: Coffee, label: "Break", onClick: undefined },
          { icon: CalendarDays, label: "Leave", onClick: undefined },
          { icon: Fingerprint, label: "Access", onClick: undefined },
          { icon: Phone, label: "Intercom", onClick: () => setIntercomOpen(true) },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            aria-label={label === "Intercom" ? "Open intercom call" : label}
            className="surface-card flex flex-col items-center gap-2 px-1.5 py-4 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon className="h-5 w-5 text-primary" />
            {label}
          </button>
        ))}
      </div>

      <IntercomCall open={intercomOpen} onClose={() => setIntercomOpen(false)} />
    </div>

  );
}
