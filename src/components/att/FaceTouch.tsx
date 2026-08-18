import { ShieldCheck, RotateCcw } from "lucide-react";
import { LiveClock } from "./LiveClock";


type Props = {
  status: "idle" | "scanning" | "verified" | "failed";
  onTouch: () => void;
  size?: number;
  label?: string;
  action?: string;
  progress?: number;
};

/** Tap-the-face biometric trigger. The face ring itself is the button. */
export function FaceTouch({
  status,
  onTouch,
  size = 300,
  label,
  action = "Clock in",
  progress = 0,
}: Props) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const pct = status === "scanning" ? progress / 100 : 1;
  const stroke =
    status === "verified"
      ? "var(--color-success)"
      : status === "failed"
        ? "var(--color-destructive)"
        : "var(--color-primary)";

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ height: size + 16, width: size + 16 }}>
        <button
          type="button"
          onClick={onTouch}
          disabled={status === "scanning" || status === "verified"}
          aria-label={label ?? "Touch face to verify"}
          className="group relative flex items-center justify-center rounded-full bg-transparent transition-transform active:scale-95 disabled:cursor-default"
          style={{ height: size, width: size }}
        >
          {status !== "idle" && (
            <svg
              className="pointer-events-none absolute inset-0 -rotate-90"
              viewBox={`0 0 ${size} ${size}`}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct)}
                className="opacity-80"
                style={{ transition: "stroke-dashoffset 0.35s linear" }}
              />
            </svg>
          )}


          <span className="relative flex flex-col items-center justify-center">
            {status === "verified" ? (
              <ShieldCheck
                className="h-16 w-16 text-success drop-shadow-[0_0_12px_var(--color-success)]"
                strokeWidth={1.3}
              />
            ) : status === "failed" ? (
              <RotateCcw
                className="h-14 w-14 animate-scale-in text-destructive drop-shadow-[0_0_12px_var(--color-destructive)]"
                strokeWidth={1.4}
              />
            ) : (
              <LiveClock size={size * 0.92} tone="accent" />
            )}
          </span>

          {status === "scanning" && (
            <>
              <span className="pointer-events-none absolute inset-6 overflow-hidden rounded-full">
                <span className="absolute inset-x-0 h-16 bg-primary/25 blur-md animate-scanline" />
                <span
                  className="absolute inset-0 animate-spin-fast"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, transparent 280deg, color-mix(in oklch, var(--color-primary) 45%, transparent) 360deg)",
                  }}
                />
              </span>
            </>
          )}
        </button>
      </div>

      <span
        className={`mt-4 font-display text-xs font-bold uppercase tracking-[0.24em] ${
          status === "failed" ? "text-destructive" : status === "verified" ? "text-success" : "text-accent"
        }`}
      >
        {status === "scanning"
          ? "Looking…"
          : status === "verified"
            ? "Face verified"
            : status === "failed"
              ? "Try again"
              : action}
      </span>

      {label && (
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          {status === "scanning"
            ? "Hold still — looking…"
            : status === "failed"
              ? "Face not recognised · tap to retry"
              : label}
        </p>
      )}
    </div>
  );
}
