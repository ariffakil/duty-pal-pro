import { useCallback, useRef, useState } from "react";
import { createParser } from "eventsource-parser";
import { resolveLang } from "@/lib/novaLang";

/** Plays a short "ding" then speaks the text with a natural human voice. */
export function useNovaVoice() {
  const ctxRef = useRef<AudioContext | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const audioCtx = useCallback(() => {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    const ctx = (ctxRef.current ??= new Ctx());
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  }, []);

  const ding = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const ctx = audioCtx();
      if (!ctx) return;
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
  }, [audioCtx]);

  /** Fallback: browser voices, picking the most natural one available. */
  const speakLocally = useCallback((text: string, lang: string) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      const base = lang.split("-")[0];
      const voices = synth.getVoices?.() ?? [];
      const natural = /natural|neural|premium|enhanced|google|siri|aria|jenny|samantha/i;
      const inLang = voices.filter((v) => v.lang.replace("_", "-").split("-")[0] === base);
      const pick =
        inLang.find((v) => natural.test(v.name) && !v.localService) ??
        inLang.find((v) => natural.test(v.name)) ??
        inLang.find((v) => v.lang.replace("_", "-") === lang) ??
        inLang[0];
      if (pick) u.voice = pick;
      u.rate = 0.98;
      u.pitch = 1.02;
      u.volume = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      synth.speak(u);
    } catch {
      setSpeaking(false);
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !enabled || !text.trim()) return;
      const lang = resolveLang();
      ding();
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setSpeaking(true);

      void (async () => {
        try {
          const res = await fetch("/api/nova-tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, lang }),
            signal: controller.signal,
          });
          if (!res.ok || !res.body) throw new Error(String(res.status));

          const ctx = audioCtx();
          if (!ctx) throw new Error("no audio context");
          let playhead = 0;
          let pending = new Uint8Array(0);
          let lastEnd = 0;

          const playChunk = (incoming: Uint8Array) => {
            const bytes = new Uint8Array(pending.length + incoming.length);
            bytes.set(pending);
            bytes.set(incoming, pending.length);
            const usable = bytes.length - (bytes.length % 2);
            pending = bytes.slice(usable);
            if (usable === 0) return;
            const samples = new Int16Array(bytes.buffer, 0, usable / 2);
            const floats = Float32Array.from(samples, (s) => s / 32768);
            const buffer = ctx.createBuffer(1, floats.length, 24000);
            buffer.copyToChannel(floats, 0);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            playhead = playhead === 0 ? ctx.currentTime + 0.45 : Math.max(playhead, ctx.currentTime);
            source.start(playhead);
            playhead += buffer.duration;
            lastEnd = playhead;
          };

          const parser = createParser({
            onEvent(event) {
              let data: { type?: string; audio?: string };
              try {
                data = JSON.parse(event.data) as { type?: string; audio?: string };
              } catch {
                return;
              }
              if (data.type !== "speech.audio.delta" || !data.audio) return;
              const binary = atob(data.audio);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              playChunk(bytes);
            },
          });

          const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) parser.feed(value);
          }
          if (lastEnd === 0) throw new Error("no audio");
          window.setTimeout(
            () => setSpeaking(false),
            Math.max(0, (lastEnd - ctx.currentTime) * 1000),
          );
        } catch (err) {
          if (controller.signal.aborted) return;
          console.error("Nova voice fell back to the browser voice:", err);
          speakLocally(text, lang);
        }
      })();
    },
    [audioCtx, ding, enabled, speakLocally],
  );

  const toggle = useCallback(() => {
    setEnabled((e) => {
      if (e && typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
        abortRef.current?.abort();
        setSpeaking(false);
      }
      return !e;
    });
  }, []);

  return { speak, ding, enabled, toggle, speaking };
}
