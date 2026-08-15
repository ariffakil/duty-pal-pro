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

const STORAGE_KEY = "nova.lang";
let current = "auto";
const listeners = new Set<(v: string) => void>();

/** The concrete BCP-47 tag to hand to speech APIs. */
export function resolveLang(code = current): string {
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
    return () => {
      listeners.delete(setCode);
    };
  }, []);

  const meta = NOVA_LANGS.find((l) => l.code === code) ?? NOVA_LANGS[0];
  return { code, meta, resolved: resolveLang(code), setLang: setNovaLang };
}
