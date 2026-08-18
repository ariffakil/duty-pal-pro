import { useEffect, useRef, useState } from "react";
import { X, Send, Mic, Square, Languages, Check } from "lucide-react";

import { NovaMascot } from "@/components/att/NovaMascot";
import novaAvatar from "@/assets/nova-avatar.png.asset.json";


import { useSpeechInput } from "@/hooks/useSpeechInput";
import { NOVA_LANGS, useNovaLang } from "@/lib/novaLang";

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
  speaking = false,
}: {
  context: NovaContext;
  onSpeak: (text: string) => void;
  speaking?: boolean;
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
  const askRef = useRef<(t: string) => void>(() => {});
  const voice = useSpeechInput((t) => askRef.current(t));
  const { code: langCode, meta: lang, resolved, detectedMeta, setLang } = useNovaLang();
  const [langOpen, setLangOpen] = useState(false);

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
  askRef.current = ask;

  const openChat = () => {
    setOpen(true);
    if (voice.supported) voice.start();
  };

  // Draggable Nova launcher (mouse / touch).
  const dragRef = useRef<HTMLDivElement | null>(null);
  const movedRef = useRef(false);
  const [pos, setPos] = useState({ right: 20, bottom: 20 });

  const onPointerDown = (e: React.PointerEvent) => {
    const el = dragRef.current;
    if (!el) return;
    movedRef.current = false;
    const startX = e.clientX;
    const startY = e.clientY;
    const start = { ...pos };
    const parent = el.parentElement?.getBoundingClientRect();

    const move = (ev: PointerEvent) => {
      const dx = startX - ev.clientX;
      const dy = startY - ev.clientY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedRef.current = true;
      const maxR = parent ? parent.width - 88 : 300;
      const maxB = parent ? parent.height - 88 : 600;
      setPos({
        right: Math.min(Math.max(start.right + dx, 4), Math.max(4, maxR)),
        bottom: Math.min(Math.max(start.bottom + dy, 4), Math.max(4, maxB)),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setTimeout(() => (movedRef.current = false), 50);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };


  return (
    <>
      {!open && (
        <div
          ref={dragRef}
          onPointerDown={onPointerDown}
          style={{ right: pos.right, bottom: pos.bottom, touchAction: "none" }}
          className="absolute z-20 cursor-grab active:cursor-grabbing select-none"
        >
          <button
            onClick={() => {
              if (movedRef.current) return;
              openChat();
            }}
            aria-label="Ask Nova by voice or text"
            className="relative flex h-20 w-20 items-center justify-center"
          >
            <img
              src={novaAvatar.url}
              alt="Nova AI assistant"
              draggable={false}
              className="h-20 w-20 animate-float-soft object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
            />
            <span className="absolute right-2 top-2 h-3 w-3 rounded-full bg-success ring-2 ring-background" />
          </button>
        </div>
      )}



      {open && (
        <div className="absolute inset-x-0 bottom-0 z-30 flex max-h-[78%] flex-col rounded-t-[2rem] border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-5 pb-3 pt-4">
            <NovaMascot className="h-9 w-9 animate-float-soft" />

            <div className="flex-1">
              <p className="text-sm font-semibold">Ask Nova</p>
              <p className="text-[11px] text-success">
                {detectedMeta
                  ? `Heard ${detectedMeta.flag} ${detectedMeta.label} · switched automatically`
                  : `Online · speaking ${langCode === "auto" ? `auto (${resolved})` : lang.label}`}
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setLangOpen((o) => !o)}
                aria-label="Choose Nova language"
                aria-expanded={langOpen}
                className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                <Languages className="h-3.5 w-3.5" />
                <span>{lang.flag}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-9 z-40 w-44 overflow-hidden rounded-2xl border border-border bg-background/95 py-1 backdrop-blur-xl">
                  {NOVA_LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                        if (voice.listening) voice.stop();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-foreground/90 transition-colors hover:bg-secondary/60"
                    >
                      <span>{l.flag}</span>
                      <span className="flex-1">{l.label}</span>
                      {l.code === langCode && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                voice.stop();
                setOpen(false);
              }}
              aria-label="Close Nova chat"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-5 pb-2">
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
            {voice.listening && (
              <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm border border-primary/40 bg-primary/10 px-4 py-2 text-sm italic text-primary">
                {voice.interim || "Listening…"}
              </p>
            )}
            {voice.error && <p className="text-xs text-destructive">{voice.error}</p>}
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
              placeholder={voice.listening ? "Listening… speak now" : "Ask or tap the mic to speak…"}
              aria-label="Ask Nova a question"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {voice.supported && (
              <button
                type="button"
                onClick={voice.toggle}
                aria-label={voice.listening ? "Stop listening" : "Ask Nova by voice"}
                aria-pressed={voice.listening}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                  voice.listening
                    ? "animate-pulse border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:text-primary"
                }`}
              >
                {voice.listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
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
