import { Check, Loader2 } from "lucide-react";

type Props = {
  progress: number;
  steps: string[];
};

/** Animated multi-step face verification progress panel. */
export function VerifyProgress({ progress, steps }: Props) {
  const active = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length));

  return (
    <div className="mt-5 w-full max-w-xs animate-fade-in rounded-2xl border border-primary/20 bg-secondary/40 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
          Verifying face
        </p>
        <p className="font-display text-sm font-semibold tabular-nums text-primary">
          {Math.round(progress)}%
        </p>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-[width] duration-300 ease-out"
          style={{ width: `${Math.max(4, progress)}%` }}
        />
      </div>

      <ul className="mt-3 space-y-2">
        {steps.map((s, i) => {
          const done = i < active || progress >= 100;
          const current = i === active && progress < 100;
          return (
            <li
              key={s}
              className={`flex items-center gap-2 text-xs transition-opacity duration-300 ${
                done || current ? "opacity-100" : "opacity-40"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  done
                    ? "border-success bg-success/20 text-success"
                    : current
                      ? "border-primary text-primary"
                      : "border-muted-foreground/40 text-muted-foreground"
                }`}
              >
                {done ? (
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                ) : current ? (
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                ) : null}
              </span>
              <span
                className={
                  done ? "text-success" : current ? "font-medium text-foreground" : "text-muted-foreground"
                }
              >
                {s}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
