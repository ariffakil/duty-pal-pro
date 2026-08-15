import { useState } from "react";
import { Send, X, Loader2, CheckCircle2 } from "lucide-react";

export type RequestKind = "late" | "leave";

const PRESETS: Record<RequestKind, string[]> = {
  late: [
    "Bus was late",
    "Heavy traffic",
    "Metro delay",
    "Vehicle breakdown",
    "Medical appointment",
    "Family emergency",
  ],
  leave: [
    "Sick leave",
    "Family emergency",
    "Medical appointment",
    "Personal work",
    "Travel / flight delay",
    "Half day leave",
  ],
};

type Props = {
  kind: RequestKind;
  lateMinutes?: number;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<{ reference: string; notified: string }>;
};

export function NovaRequestSheet({ kind, lateMinutes = 0, onClose, onSubmit }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [result, setResult] = useState<{ reference: string; notified: string } | null>(null);

  const reason = selected === "__custom" ? custom.trim() : (selected ?? "");
  const title = kind === "late" ? "Late arrival reason" : "Leave request";

  const send = async () => {
    if (!reason) return;
    setState("sending");
    try {
      const res = await onSubmit(reason);
      setResult(res);
      setState("sent");
    } catch {
      setState("idle");
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center rounded-[2.4rem] bg-background/70 backdrop-blur-sm">
      <div className="surface-card w-full rounded-b-[2.4rem] rounded-t-3xl p-5">
        {state === "sent" && result ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
            <p className="mt-3 font-display text-lg font-bold">Sent to your Manager</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ref {result.reference} · emailed to {result.notified}
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-2xl px-6 py-3.5 text-sm font-semibold text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-aurora)" }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-bold">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {kind === "late"
                    ? `You are late by ${lateMinutes} minutes. Pick a reason for your Manager.`
                    : "You have not clocked in. Send a leave request to your Manager."}
                </p>
              </div>
              <button onClick={onClose} aria-label="Close" className="rounded-xl p-1.5 text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {PRESETS[kind].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelected(p)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected === p
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-secondary/40 text-muted-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setSelected("__custom")}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected === "__custom"
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-secondary/40 text-muted-foreground"
                }`}
              >
                Custom words
              </button>
            </div>

            {selected === "__custom" && (
              <textarea
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                rows={3}
                placeholder="Type your reason…"
                className="mt-3 w-full resize-none rounded-2xl border border-border bg-secondary/40 p-3 text-sm outline-none focus:border-primary"
              />
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm font-semibold text-muted-foreground"
              >
                Not now
              </button>
              <button
                onClick={send}
                disabled={!reason || state === "sending"}
                className="flex flex-[1.4] items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                style={{ backgroundImage: "var(--gradient-aurora)" }}
              >
                {state === "sending" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send to Manager
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
