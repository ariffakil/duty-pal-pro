import { MapPin, Loader2, Lock } from "lucide-react";
import { FaceTouch } from "./FaceTouch";

type Props = {
  status: "idle" | "scanning" | "verified";
  progress: number;
  onScan: () => void;
};

const steps = ["Detecting face", "Liveness check", "Matching template", "Server verification"];

export function FaceScan({ status, progress, onScan }: Props) {
  const activeStep = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length));

  return (
    <div className="flex flex-col items-center px-6 pb-10 pt-2 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
        Biometric check-in
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Touch the face to clock in</h2>

      <div className="mt-8">
        <FaceTouch status={status} onTouch={onScan} label="Tap to verify" />
      </div>

      <div className="mt-8 w-full">
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

      <p className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" /> Encrypted on-device face template
      </p>
    </div>
  );
}
