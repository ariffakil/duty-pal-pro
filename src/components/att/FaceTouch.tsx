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
  size = 224,
  label,
  action = "Clock in",
  progress = 0,
}: Props) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const pct = status === "verified" ? 1 : status === "failed" ? 1 : progress / 100;
  const stroke =
    status === "verified"
      ? "var(--color-success)"
      : status === "failed"
        ? "var(--color-destructive)"
        : "var(--color-primary)";

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ height: size + 56, width: size + 56 }}>
        <span
          className="absolute rounded-full border border-primary/15 animate-spin-slow"
          style={{ height: size + 24, width: size + 24 }}
        />
        <span
          className="absolute rounded-full border border-dashed border-accent/15 animate-spin-reverse"
          style={{ height: size + 54, width: size + 54 }}
        />

        {(status === "idle" || status === "failed") && (
          <>
            {[0, 0.8, 1.6].map((delay) => (
              <span
                key={delay}
                className="pointer-events-none absolute rounded-full border-2 border-primary/50 animate-pulse-ring"
                style={{
                  height: size + 8,
                  width: size + 8,
                  animationDelay: `${delay}s`,
                }}
              />
            ))}
            <span
              className="pointer-events-none absolute rounded-full bg-primary/10 blur-xl animate-pulse-ring"
              style={{ height: size, width: size, animationDelay: "0.4s" }}
            />
          </>
        )}

        <button
          type="button"
          onClick={onTouch}
          disabled={status === "scanning" || status === "verified"}
          aria-label={label ?? "Touch face to verify"}
          className="group relative flex items-center justify-center rounded-full border-4 border-secondary bg-background transition-transform active:scale-95 disabled:cursor-default"
          style={{ height: size, width: size, boxShadow: "var(--shadow-glow)" }}
        >
          <span
            className={`absolute inset-2 rounded-full border-2 ${
              status === "verified"
                ? "border-success/50"
                : status === "failed"
                  ? "border-destructive/60"
                  : "border-primary/30"
            }`}
          />

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
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              className="opacity-80"
              style={{ transition: "stroke-dashoffset 0.35s linear" }}
            />
          </svg>

          <span className="relative flex flex-col items-center">
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
              <LiveClock size={size * 0.42} tone="accent" />

            )}
            <span
              className={`mt-3 font-display text-xs font-bold uppercase tracking-[0.24em] ${
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
              {[0, 0.5, 1].map((d) => (
                <span
                  key={d}
                  className="pointer-events-none absolute rounded-full border border-primary/40 animate-pulse-ring"
                  style={{ height: size, width: size, animationDelay: `${d}s` }}
                />
              ))}
            </>
          )}
        </button>
      </div>

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
