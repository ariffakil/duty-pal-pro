import { Volume2, VolumeX } from "lucide-react";
import novaAvatar from "@/assets/nova-avatar.png.asset.json";

export type NovaTone = "info" | "nudge" | "cheer";

export function NovaAvatar({
  text,
  tone = "info",
  speaking,
  voiceOn,
  onToggleVoice,
  onReplay,
}: {
  text: string;
  tone?: NovaTone;
  speaking: boolean;
  voiceOn: boolean;
  onToggleVoice: () => void;
  onReplay: () => void;
}) {
  const accent =
    tone === "nudge" ? "text-warning" : tone === "cheer" ? "text-success" : "text-accent";

  return (
    <div className="px-6 pt-2">
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-secondary/25 p-4 backdrop-blur">
        <button onClick={onReplay} aria-label="Replay Nova message" className="relative shrink-0">
          <span
            className={`absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full blur-lg ${
              speaking ? "opacity-80" : "opacity-40"
            }`}
            style={{ backgroundImage: "var(--gradient-aurora)" }}
          />
          <img
            src={novaAvatar.url}
            alt="Nova AI assistant avatar"
            className={`relative h-12 w-12 object-contain drop-shadow-lg ${
              speaking ? "animate-pulse-ring" : "animate-float-soft"
            }`}
          />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={`font-display text-[10px] font-bold uppercase tracking-[0.18em] ${accent}`}>
              Nova AI
            </p>
            {speaking && (
              <span className="flex items-end gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-0.5 rounded-full bg-primary"
                    style={{ animation: "pulse 0.7s ease-in-out infinite", animationDelay: `${i * 0.15}s` }}
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
          </div>
          <p className="mt-1 text-sm leading-snug text-foreground/85">{text}</p>
        </div>
      </div>
    </div>
  );
}
