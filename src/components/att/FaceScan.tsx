import { ScanFace, ShieldCheck, MapPin, Loader2 } from "lucide-react";

type Props = {
  status: "idle" | "scanning" | "verified";
  progress: number;
  onScan: () => void;
};

const steps = ["Detecting face", "Liveness check", "Matching template", "Server verification"];

export function FaceScan({ status, progress, onScan }: Props) {
  const activeStep = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length));

  return (
    <div className="flex flex-col items-center px-6 pb-8 pt-4 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
        Biometric check-in
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Verify your face</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Position your face inside the frame to mark attendance
      </p>

      <div className="relative mt-8 flex h-60 w-60 items-center justify-center">
        {status === "scanning" && (
          <span className="absolute inset-0 rounded-full border border-primary/40 animate-pulse-ring" />
        )}
        <div className="absolute inset-3 rounded-full halo" />
        <div
          className={`relative flex h-52 w-52 items-center justify-center overflow-hidden rounded-full border-2 bg-secondary/40 backdrop-blur ${
            status === "verified"
              ? "border-success glow-ring"
              : status === "scanning"
                ? "border-primary glow-ring"
                : "border-border"
          }`}
        >
          {status === "verified" ? (
            <ShieldCheck className="h-20 w-20 text-success" strokeWidth={1.4} />
          ) : (
            <ScanFace
              className={`h-24 w-24 ${status === "scanning" ? "text-primary" : "text-muted-foreground"}`}
              strokeWidth={1}
            />
          )}
          {status === "scanning" && (
            <span className="pointer-events-none absolute inset-x-0 h-16 bg-primary/25 blur-md animate-scanline" />
          )}
        </div>

        {[0, 90, 180, 270].map((deg) => (
          <span
            key={deg}
            className="absolute h-6 w-6 rounded-md border-t-2 border-l-2 border-primary/70"
            style={{
              transform: `rotate(${deg}deg) translate(-108px, -108px) rotate(${-deg}deg)`,
            }}
          />
        ))}
      </div>

      <div className="mt-7 w-full">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundImage: "var(--gradient-aurora)" }}
          />
        </div>
        <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          {status === "scanning" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              {steps[activeStep]}…
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 text-primary" />
              Karama, Dubai · Geofence active
            </>
          )}
        </p>
      </div>

      <button
        onClick={onScan}
        disabled={status !== "idle"}
        className="mt-8 w-full rounded-2xl px-6 py-4 text-base font-semibold text-primary-foreground transition-transform disabled:opacity-60 active:scale-[0.98]"
        style={{ backgroundImage: "var(--gradient-aurora)", boxShadow: "var(--shadow-glow)" }}
      >
        {status === "scanning" ? "Verifying…" : "Scan face to clock in"}
      </button>
      <p className="mt-3 text-xs text-muted-foreground">
        Encrypted face template · Never leaves your device unhashed
      </p>
    </div>
  );
}
