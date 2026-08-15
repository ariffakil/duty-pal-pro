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
    tone === "nudge"
      ? "text-warning"
      : tone === "cheer"
        ? "text-success"
        : "text-primary";

  return (
    <div className="px-6 pt-3">
      <div className="flex items-start gap-3">
        <button
          onClick={onReplay}
          aria-label="Replay Nova message"
          className="relative shrink-0"
        >
          <span
            className={`absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl ${
              speaking ? "opacity-70" : "opacity-40"
            }`}
            style={{ backgroundImage: "var(--gradient-aurora)" }}
          />
          <img
            src={novaAvatar.url}
            alt="Nova AI assistant avatar"
            className={`relative h-20 w-20 object-contain drop-shadow-lg ${
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

        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
              Nova <span className={accent}>AI</span>
            </p>
            <button
              onClick={onToggleVoice}
              aria-label={voiceOn ? "Mute Nova voice" : "Unmute Nova voice"}
              className="ml-auto text-muted-foreground transition-colors hover:text-primary"
            >
              {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{text}</p>
        </div>
      </div>
    </div>
  );
}
