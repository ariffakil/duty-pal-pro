import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import novaAvatar from "@/assets/nova-avatar.png.asset.json";

export type NovaContext = {
  name: string;
  site: string;
  shift: string;
  clockIn: string | null;
  clockOut: string | null;
  clockedOut: boolean;
  lateMinutes: number;
  remaining: { h: number; m: number; s: number };
  nextReminder: string;
};

type ChatMsg = { id: number; from: "nova" | "me"; text: string };

const pad = (n: number) => String(n).padStart(2, "0");

export function answerFor(q: string, c: NovaContext): string {
  const t = q.toLowerCase();

  if (/(duty|shift|schedule|roster|timing)/.test(t))
    return `Your duty schedule today is ${c.shift} at ${c.site}, ${c.name}.`;

  if (/(late|on ?time|delay)/.test(t))
    return c.clockIn
      ? c.lateMinutes > 0
        ? `You clocked in at ${c.clockIn}, late today by ${pad(Math.floor(c.lateMinutes / 60))}:${pad(c.lateMinutes % 60)} minutes.`
        : `You clocked in at ${c.clockIn} and you are on time today. Well done.`
      : "You have not clocked in yet. Touch the face icon to verify and mark attendance.";

  if (/(remind|next|alert|notif)/.test(t)) return `Next reminder: ${c.nextReminder}.`;

  if (/(remain|left|how long|countdown|end|finish|out)/.test(t))
    return c.clockedOut
      ? `Your shift is closed. Working hours ${c.clockIn} to ${c.clockOut}.`
      : c.clockIn
        ? `${pad(c.remaining.h)}:${pad(c.remaining.m)}:${pad(c.remaining.s)} remaining until clock out at ${c.clockOut}.`
        : "Your countdown starts once you clock in with a face verification.";

  if (/(clock ?in|check ?in|attendance|mark)/.test(t))
    return c.clockIn
      ? `Attendance marked at ${c.clockIn} at ${c.site}.`
      : "Touch the face icon on your home screen and hold still — verification takes about a second.";

  if (/(break|lunch)/.test(t)) return "You have a 45 minute break entitlement. Tap Break to start it.";

  if (/(leave|holiday|vacation)/.test(t))
    return "You have 12 annual leave days remaining. Tap Leave to raise a request.";

  if (/(access|door|gate|area)/.test(t))
    return `Your badge allows Gate 2, Office Floor 3 and the Server Room at ${c.site}.`;

  if (/(hi|hello|hey|good morning|good evening|salam)/.test(t))
    return `Hello ${c.name}. I'm Nova, your shift assistant. Ask me about duty time, lateness or reminders.`;

  return "I can help with duty schedule, lateness, remaining time, break, leave and access areas. Which one shall I check?";
}

const CHIPS = ["My duty time", "Am I late?", "Next reminder", "Time remaining"];

export function NovaChat({
  context,
  onSpeak,
}: {
  context: NovaContext;
  onSpeak: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      id: 1,
      from: "nova",
      text: "Hi, I'm Nova. Ask me anything about your shift today.",
    },
  ]);
  const id = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [msgs, open]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const reply = answerFor(q, context);
    id.current += 2;
    setMsgs((m) => [
      ...m,
      { id: id.current - 1, from: "me", text: q },
      { id: id.current, from: "nova", text: reply },
    ]);
    setInput("");
    onSpeak(reply);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ask Nova"
          className="absolute bottom-5 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground"
          style={{ backgroundImage: "var(--gradient-aurora)", boxShadow: "var(--shadow-glow)" }}
        >
          <MessageCircle className="h-6 w-6 animate-float-soft" />
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-success ring-2 ring-background" />
        </button>
      )}

      {open && (
        <div className="absolute inset-x-0 bottom-0 z-30 flex max-h-[78%] flex-col rounded-t-[2rem] border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-5 pb-3 pt-4">
            <img
              src={novaAvatar.url}
              alt="Nova AI assistant"
              className="h-9 w-9 object-contain animate-float-soft"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">Ask Nova</p>
              <p className="text-[11px] text-success">Online · shift assistant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Nova chat"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-2">
            {msgs.map((m) =>
              m.from === "nova" ? (
                <p key={m.id} className="max-w-[85%] text-sm leading-relaxed text-foreground/90">
                  {m.text}
                </p>
              ) : (
                <p
                  key={m.id}
                  className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  {m.text}
                </p>
              ),
            )}
            <div ref={endRef} />
          </div>

          <div className="flex gap-2 overflow-x-auto px-5 py-2">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => ask(c)}
                className="shrink-0 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                {c}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 border-t border-border px-4 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about duty time, lateness…"
              aria-label="Ask Nova a question"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Send"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-aurora)" }}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
