import { Send } from "lucide-react";

export type BuddyMessage = { id: number; text: string; tone?: "info" | "nudge" | "cheer" };

export function AiBuddy({ messages }: { messages: BuddyMessage[] }) {
  const items = messages.slice(-4).reverse();

  return (
    <div className="mt-4 rounded-t-[2.5rem] border-t border-primary/15 bg-secondary/20 px-6 pb-8 pt-6 backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-base font-bold tracking-tight text-foreground">
          Activity Timeline
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">View all</span>
      </div>

      <div className="relative space-y-5">
        <div className="absolute bottom-2 left-[11px] top-2 w-px bg-gradient-to-b from-primary to-transparent opacity-25" />

        {items.map((m, i) => (
          <div key={m.id} className={`relative flex items-start gap-4 ${i === 0 ? "" : "opacity-60"}`}>
            <span
              className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                i === 0
                  ? m.tone === "nudge"
                    ? "bg-warning glow-ring"
                    : m.tone === "cheer"
                      ? "bg-success glow-ring"
                      : "bg-primary glow-ring"
                  : "border border-primary/30 bg-secondary"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-background" />
            </span>
            <p className="flex-1 text-sm leading-snug text-foreground/85">{m.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2">
        <input
          placeholder="Ask Nova about your hours…"
          className="h-11 flex-1 rounded-xl border border-input bg-background/60 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <button
          className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground"
          style={{ backgroundImage: "var(--gradient-aurora)" }}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
