import { ScanFace, ShieldCheck } from "lucide-react";

type Props = {
  status: "idle" | "scanning" | "verified";
  onTouch: () => void;
  size?: number;
  label?: string;
};

/** Tap-the-face biometric trigger. The face ring itself is the button. */
export function FaceTouch({ status, onTouch, size = 208, label }: Props) {
  const corner = size / 2 - 16;

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onTouch}
        disabled={status !== "idle"}
        aria-label={label ?? "Touch face to verify"}
        className="relative flex items-center justify-center rounded-full transition-transform active:scale-95 disabled:cursor-default"
        style={{ height: size, width: size }}
      >
        {status !== "verified" && (
          <span className="absolute inset-0 rounded-full border border-primary/40 animate-pulse-ring" />
        )}
        <span className="absolute inset-4 rounded-full halo" />
        <span
          className={`relative flex items-center justify-center overflow-hidden rounded-full border-2 backdrop-blur ${
            status === "verified"
              ? "border-success glow-ring bg-success/10"
              : status === "scanning"
                ? "border-primary glow-ring bg-secondary/40"
                : "border-primary/50 bg-secondary/40"
          }`}
          style={{ height: size - 26, width: size - 26 }}
        >
          {status === "verified" ? (
            <ShieldCheck className="h-16 w-16 text-success" strokeWidth={1.4} />
          ) : (
            <ScanFace
              className={`h-20 w-20 ${status === "scanning" ? "text-primary" : "text-primary/80"}`}
              strokeWidth={1}
            />
          )}
          {status === "scanning" && (
            <span className="pointer-events-none absolute inset-x-0 h-16 bg-primary/25 blur-md animate-scanline" />
          )}
        </span>

        {[0, 90, 180, 270].map((deg) => (
          <span
            key={deg}
            className="absolute h-6 w-6 rounded-md border-l-2 border-t-2 border-primary/60"
            style={{
              transform: `rotate(${deg}deg) translate(${-corner}px, ${-corner}px) rotate(${-deg}deg)`,
            }}
          />
        ))}
      </button>
      {label && (
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
          {status === "scanning" ? "Verifying…" : label}
        </p>
      )}
    </div>
  );
}
