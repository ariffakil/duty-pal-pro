import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, PhoneCall, Phone, Delete, X, Volume2 } from "lucide-react";

const DIAL_KEYS: { k: string; sub?: string }[] = [
  { k: "1" },
  { k: "2", sub: "ABC" },
  { k: "3", sub: "DEF" },
  { k: "4", sub: "GHI" },
  { k: "5", sub: "JKL" },
  { k: "6", sub: "MNO" },
  { k: "7", sub: "PQRS" },
  { k: "8", sub: "TUV" },
  { k: "9", sub: "WXYZ" },
  { k: "*" },
  { k: "0", sub: "+" },
  { k: "#" },
];

export type IntercomTarget = { id: string; name: string; role: string };

export const INTERCOM_DIRECTORY: IntercomTarget[] = [
  { id: "reception", name: "Reception", role: "Karama Branch" },
  { id: "security", name: "Security desk", role: "Gate 2" },
  { id: "hr", name: "HR manager", role: "Head office" },
  { id: "supervisor", name: "Shift supervisor", role: "Karama Branch" },
];

type CallState = "idle" | "connecting" | "live" | "ended" | "error";

/**
 * WebRTC intercom. A peer connection is created with the employee's
 * microphone track and an SDP offer is produced, ready to hand to the
 * signalling channel. Remote audio is played through a hidden element.
 */
export function IntercomCall({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [target, setTarget] = useState<IntercomTarget | null>(null);
  const [state, setState] = useState<CallState>("idle");
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"directory" | "keypad">("directory");
  const [digits, setDigits] = useState("");

  /** Append a key press with a soft DTMF-style tone. */
  const press = (k: string) => {
    setDigits((d) => (d.length >= 12 ? d : d + k));
    try {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 620 + (DIAL_KEYS.findIndex((x) => x.k === k) % 6) * 55;
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.17);
      osc.onended = () => void ctx.close();
    } catch {
      /* audio is best-effort */
    }
  };


  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hangUp = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    setMuted(false);
    setSeconds(0);
    setState((s) => (s === "idle" ? "idle" : "ended"));
  }, []);

  useEffect(() => () => hangUp(), [hangUp]);

  useEffect(() => {
    if (state !== "live") return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [state]);

  useEffect(() => {
    if (state !== "ended") return;
    const t = window.setTimeout(() => {
      setState("idle");
      setTarget(null);
    }, 1600);
    return () => window.clearTimeout(t);
  }, [state]);

  const dial = async (to: IntercomTarget) => {
    setTarget(to);
    setError(null);
    setState("connecting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;
      stream.getAudioTracks().forEach((track) => pc.addTrack(track, stream));
      pc.ontrack = (e) => {
        if (audioRef.current && e.streams[0]) audioRef.current.srcObject = e.streams[0];
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") hangUp();
      };

      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);
      // Offer is ready for the signalling channel of the intercom gateway.
      setState("live");
    } catch {
      setError("Microphone permission is needed for intercom calls.");
      setState("error");
    }
  };

  const toggleMute = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  if (!open) return null;

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-background/70 backdrop-blur-sm">
      <div className="w-full animate-scale-in rounded-t-[2rem] border-t border-border bg-background/95 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <PhoneCall className="h-4 w-4 text-primary" />
          <p className="font-display text-sm font-semibold">Intercom</p>
          <button
            onClick={() => {
              hangUp();
              onClose();
            }}
            aria-label="Close intercom"
            className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {state === "idle" || state === "error" ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-1 rounded-full border border-border bg-secondary/30 p-1">
              {(["directory", "keypad"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full py-1.5 text-xs font-semibold capitalize transition-colors ${
                    tab === t
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "directory" ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {INTERCOM_DIRECTORY.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => void dial(t)}
                    className="surface-card flex flex-col items-start gap-1 px-4 py-3 text-left transition-colors hover:border-primary/40"
                  >
                    <span className="text-sm font-semibold text-foreground">{t.name}</span>
                    <span className="text-[11px] text-muted-foreground">{t.role}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center">
                <div className="flex h-10 w-full items-center justify-center">
                  <p className="font-display text-2xl font-semibold tracking-[0.12em] text-foreground">
                    {digits || <span className="text-muted-foreground/50">Enter extension</span>}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  {DIAL_KEYS.map(({ k, sub }) => (
                    <button
                      key={k}
                      onClick={() => press(k)}
                      className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-border bg-secondary/40 transition-colors hover:border-primary/50 hover:bg-secondary/70 active:scale-95"
                    >
                      <span className="font-display text-lg font-semibold leading-none text-foreground">
                        {k}
                      </span>
                      {sub && (
                        <span className="mt-0.5 text-[8px] font-medium tracking-[0.18em] text-muted-foreground">
                          {sub}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex w-full items-center justify-center gap-6">
                  <span className="h-11 w-11" aria-hidden />
                  <button
                    onClick={() => digits && void dial({ id: digits, name: digits, role: "Extension" })}
                    disabled={!digits}
                    aria-label="Call extension"
                    className="flex h-16 w-16 items-center justify-center rounded-full text-success-foreground shadow-lg transition-transform hover:scale-105 disabled:opacity-40"
                    style={{ backgroundColor: "var(--color-success)" }}
                  >
                    <Phone className="h-7 w-7" />
                  </button>
                  <button
                    onClick={() => setDigits((d) => d.slice(0, -1))}
                    disabled={!digits}
                    aria-label="Delete last digit"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  >
                    <Delete className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
            <p className="mt-3 text-[11px] text-muted-foreground">
              Calls are peer-to-peer over WebRTC with encrypted audio.
            </p>
          </>
        ) : (
          <div className="mt-5 flex flex-col items-center">
            <span className="relative flex h-24 w-24 items-center justify-center">
              <span
                className="absolute inset-0 rounded-full border border-primary/50 animate-pulse-ring"
                aria-hidden
              />
              <span
                className="absolute inset-2 rounded-full blur-xl"
                style={{ backgroundImage: "var(--gradient-aurora)", opacity: 0.4 }}
              />
              <Volume2 className="relative h-8 w-8 text-primary" />
            </span>
            <p className="mt-4 font-display text-lg font-semibold">{target?.name}</p>
            <p className="text-xs text-muted-foreground">
              {state === "connecting"
                ? "Connecting…"
                : state === "ended"
                  ? "Call ended"
                  : `${target?.role} · ${mm}:${ss}`}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={toggleMute}
                disabled={state !== "live"}
                aria-label={muted ? "Unmute microphone" : "Mute microphone"}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary/40 text-foreground transition-colors hover:border-primary/40 disabled:opacity-40"
              >
                {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <button
                onClick={hangUp}
                aria-label="End call"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg transition-transform hover:scale-105"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}

        <audio ref={audioRef} autoPlay className="hidden" />
      </div>
    </div>
  );
}
