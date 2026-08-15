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
  const ring =
    tone === "nudge"
      ? "ring-warning/50"
      : tone === "cheer"
        ? "ring-success/50"
        : "ring-primary/50";

  return (
    <div className="px-6 pt-4">
      <div className="surface-card flex items-start gap-3 p-4">
        <button
          onClick={onReplay}
          aria-label="Replay Nova message"
          className={`relative shrink-0 rounded-2xl ring-2 ${ring} transition-transform hover:scale-105`}
        >
          <span
            className="absolute inset-0 rounded-2xl opacity-70"
            style={{ backgroundImage: "var(--gradient-aurora)" }}
          />
          <img
            src={novaAvatar.url}
            alt="Nova AI assistant avatar"
            className={`relative h-16 w-16 rounded-2xl object-contain p-1 ${
              speaking ? "animate-pulse-ring" : "animate-float-soft"
            }`}
          />
          {speaking && (
            <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-end gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-1 rounded-full bg-primary"
                  style={{
                    animation: "pulse 0.7s ease-in-out infinite",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">
              Nova <span className="gradient-text">AI Assistant</span>
            </p>
            <button
              onClick={onToggleVoice}
              aria-label={voiceOn ? "Mute Nova voice" : "Unmute Nova voice"}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary/50 text-muted-foreground transition-colors hover:text-primary"
            >
              {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 rounded-2xl rounded-tl-sm bg-secondary/60 px-4 py-2.5 text-sm leading-relaxed text-foreground/90">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
