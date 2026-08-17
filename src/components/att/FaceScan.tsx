import { MapPin, Loader2 } from "lucide-react";
import { FaceTouch } from "./FaceTouch";
import { VerifyProgress } from "./VerifyProgress";

type Props = {
  status: "idle" | "scanning" | "verified" | "failed";
  progress: number;
  onScan: () => void;
};

const steps = ["Looking for face", "Liveness check", "Matching template", "Server verification"];

export function FaceScan({ status, progress, onScan }: Props) {
  const activeStep = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length));

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-6 pt-2 text-center">
      <FaceTouch
        status={status}
        onTouch={onScan}
        progress={progress}
        action="Clock in"
        label="Tap the face to verify"
      />

      {status === "scanning" && <VerifyProgress progress={progress} steps={steps} />}

      {status === "failed" && (
        <div className="mt-5 w-full max-w-xs animate-fade-in rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-left">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-destructive">
            Verification failed
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Face not recognised. Move to better light, keep your face centred, then try again.
          </p>
          <button
            type="button"
            onClick={onScan}
            className="mt-3 w-full rounded-xl bg-primary px-4 py-2.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground transition-transform active:scale-95"
          >
            Try again
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-accent/15 bg-secondary/40 px-4 py-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        <p className="text-xs font-medium text-accent">
          {status === "scanning"
            ? `${steps[activeStep]}…`
            : status === "failed"
              ? "No match · retry required"
              : "Karama, Dubai · Zone Delta-4"}
        </p>
        {status === "scanning" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        ) : (
          <MapPin className="h-3.5 w-3.5 text-primary" />
        )}
      </div>
    </div>
  );
}
