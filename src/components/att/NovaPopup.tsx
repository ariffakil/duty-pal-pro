import { Volume2, VolumeX, X } from "lucide-react";
import novaAvatar from "@/assets/nova-avatar.png.asset.json";

export type NovaTone = "info" | "nudge" | "cheer";

/**
 * Nova speaks through a transient popup: it appears only when there is
 * something to say and disappears once the speech finishes.
 */
export function NovaPopup({
  open,
  text,
  tone = "info",
  speaking,
  voiceOn,
  onToggleVoice,
  onClose,
}: {
  open: boolean;
  text: string;
  tone?: NovaTone;
  speaking: boolean;
  voiceOn: boolean;
  onToggleVoice: () => void;
  onClose: () => void;
}) {
  if (!open || !text) return null;

  const accent =
    tone === "nudge" ? "text-warning" : tone === "cheer" ? "text-success" : "text-accent";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-center px-5 pt-20">
      <div className="pointer-events-auto w-full max-w-[340px] animate-scale-in rounded-3xl border border-primary/25 bg-background/90 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <span className="relative shrink-0">
            <span
              className={`absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full blur-lg ${
                speaking ? "opacity-80" : "opacity-35"
              }`}
              style={{ backgroundImage: "var(--gradient-aurora)" }}
            />
            <img
              src={novaAvatar.url}
              alt="Nova AI assistant"
              className={`relative h-11 w-11 object-contain ${
                speaking ? "animate-pulse-ring" : "animate-float-soft"
              }`}
            />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p
                className={`font-display text-[10px] font-bold uppercase tracking-[0.18em] ${accent}`}
              >
                Nova AI
              </p>
              {speaking && (
                <span className="flex items-end gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-0.5 rounded-full bg-primary"
                      style={{
                        animation: "pulse 0.7s ease-in-out infinite",
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </span>
              )}
              <button
                onClick={onToggleVoice}
                aria-label={voiceOn ? "Mute Nova voice" : "Unmute Nova voice"}
                className="ml-auto text-muted-foreground transition-colors hover:text-primary"
              >
                {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                onClick={onClose}
                aria-label="Dismiss Nova"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm leading-snug text-foreground/90">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
