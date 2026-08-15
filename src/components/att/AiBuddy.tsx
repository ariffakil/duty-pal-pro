import { Bot, Send, Sparkles } from "lucide-react";

export type BuddyMessage = { id: number; text: string; tone?: "info" | "nudge" | "cheer" };

export function AiBuddy({ messages }: { messages: BuddyMessage[] }) {
  return (
    <div className="px-6 pb-10">
      <div className="surface-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl animate-float-soft"
            style={{ backgroundImage: "var(--gradient-aurora)" }}
          >
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              Nova <span className="gradient-text">AI Buddy</span>
            </p>
            <p className="text-xs text-muted-foreground">Your shift companion · always on</p>
          </div>
          <Sparkles className="ml-auto h-4 w-4 text-primary" />
        </div>

        <div className="space-y-3 px-5 py-4">
          {messages.map((m) => (
            <div key={m.id} className="flex gap-3">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  m.tone === "nudge"
                    ? "bg-warning"
                    : m.tone === "cheer"
                      ? "bg-success"
                      : "bg-primary"
                }`}
              />
              <p className="rounded-2xl rounded-tl-sm bg-secondary/60 px-4 py-2.5 text-sm leading-relaxed text-foreground/90">
                {m.text}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-border px-4 py-3">
          <input
            placeholder="Ask Nova about your hours…"
            className="h-11 flex-1 rounded-xl border border-input bg-secondary/40 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
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
    </div>
  );
}
