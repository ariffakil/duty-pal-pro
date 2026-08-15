import { useCallback, useRef, useState } from "react";

/** Plays a short "ding" then speaks the text aloud. */
export function useNovaVoice() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const ding = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = (ctxRef.current ??= new Ctx());
      if (ctx.state === "suspended") void ctx.resume();
      const now = ctx.currentTime;
      [1318.5, 1760].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = now + i * 0.09;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch {
      /* audio unavailable */
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !enabled) return;
      ding();
      const synth = window.speechSynthesis;
      if (!synth) return;
      window.setTimeout(() => {
        try {
          synth.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.rate = 1;
          u.pitch = 1.1;
          u.volume = 1;
          u.onstart = () => setSpeaking(true);
          u.onend = () => setSpeaking(false);
          u.onerror = () => setSpeaking(false);
          synth.speak(u);
        } catch {
          setSpeaking(false);
        }
      }, 260);
    },
    [ding, enabled],
  );

  const toggle = useCallback(() => {
    setEnabled((e) => {
      if (e && typeof window !== "undefined") window.speechSynthesis?.cancel();
      return !e;
    });
  }, []);

  return { speak, ding, enabled, toggle, speaking };
}
