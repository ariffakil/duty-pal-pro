import { useEffect, useState } from "react";

export type NovaLang = {
  /** BCP-47 tag, or "auto" to follow the device language. */
  code: string;
  label: string;
  flag: string;
};

export const NOVA_LANGS: NovaLang[] = [
  { code: "auto", label: "Auto-detect", flag: "🌐" },
  { code: "en-US", label: "English", flag: "🇬🇧" },
  { code: "ar-AE", label: "العربية", flag: "🇦🇪" },
  { code: "hi-IN", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ur-PK", label: "اردو", flag: "🇵🇰" },
  { code: "ml-IN", label: "മലയാളം", flag: "🇮🇳" },
  { code: "tl-PH", label: "Filipino", flag: "🇵🇭" },
  { code: "fr-FR", label: "Français", flag: "🇫🇷" },
];

/** Guesses the spoken language from a transcript (script + common words). */
export function detectLangFromText(text: string): string | null {
  const t = text.trim();
  if (t.length < 2) return null;
  if (/[\u0600-\u06FF]/.test(t)) return /[\u0679\u0688\u06BE\u06C1\u06D2]/.test(t) ? "ur-PK" : "ar-AE";
  if (/[\u0900-\u097F]/.test(t)) return "hi-IN";
  if (/[\u0D00-\u0D7F]/.test(t)) return "ml-IN";
  const w = ` ${t.toLowerCase().replace(/[^\p{L}\s]/gu, " ")} `;
  const has = (words: string[]) => words.some((x) => w.includes(` ${x} `));
  if (has(["bonjour", "merci", "je", "mon", "quelle", "heure", "travail", "aujourd'hui"]))
    return "fr-FR";
  if (has(["ako", "ang", "ng", "po", "salamat", "kailan", "trabaho", "oras"])) return "tl-PH";
  if (has(["mera", "kitna", "kya", "aaj", "duty", "samay", "kab", "hai", "nahi"]) && !has(["is", "the", "my"]))
    return "hi-IN";
  if (has(["the", "my", "am", "is", "what", "when", "time", "late", "shift", "hello"]))
    return "en-US";
  return null;
}

const STORAGE_KEY = "nova.lang";
let current = "auto";
/** Language heard in the last spoken question; overrides "auto". */
let detected: string | null = null;
const listeners = new Set<(v: string) => void>();
const detectedListeners = new Set<(v: string | null) => void>();

export function setDetectedLang(code: string | null) {
  if (detected === code) return;
  detected = code;
  detectedListeners.forEach((l) => l(code));
}

export function getDetectedLang() {
  return detected;
}

/** The concrete BCP-47 tag to hand to speech APIs. */
export function resolveLang(code = current): string {
  if (detected && (code === "auto" || detected.split("-")[0] !== code.split("-")[0])) return detected;
  if (code !== "auto") return code;
  if (typeof navigator === "undefined") return "en-US";
  return navigator.language || "en-US";
}

export function setNovaLang(code: string) {
  current = code;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* storage unavailable */
    }
  }
  listeners.forEach((l) => l(code));
}

export function getNovaLang() {
  return current;
}

/** Subscribes a component to the selected language (hydration-safe). */
export function useNovaLang() {
  const [code, setCode] = useState(current);
  const [detectedCode, setDetectedCode] = useState<string | null>(detected);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== current) {
        current = saved;
        setCode(saved);
      }
    } catch {
      /* storage unavailable */
    }
    listeners.add(setCode);
    detectedListeners.add(setDetectedCode);
    return () => {
      listeners.delete(setCode);
      detectedListeners.delete(setDetectedCode);
    };
  }, []);

  const meta = NOVA_LANGS.find((l) => l.code === code) ?? NOVA_LANGS[0]!;
  const resolved = resolveLang(code);
  const detectedMeta = detectedCode
    ? (NOVA_LANGS.find((l) => l.code === detectedCode) ?? {
        code: detectedCode,
        label: detectedCode,
        flag: "🗣️",
      })
    : null;
  return {
    code,
    meta,
    resolved,
    detected: detectedCode,
    detectedMeta,
    setLang: (c: string) => {
      setDetectedLang(null);
      setNovaLang(c);
    },
  };
}
