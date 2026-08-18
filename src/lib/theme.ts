/**
 * Runtime theming: lets an employee tune the accent / clock colours from the
 * UI without touching code. Values are written as CSS custom properties on
 * <html> and persisted per device (and per employee) in localStorage.
 */

export type ThemeSettings = {
  /** Preset id, or "custom" when the sliders were touched. */
  preset: string;
  /** Primary hue 0-360 (OKLCH hue channel). */
  primaryHue: number;
  /** Accent hue 0-360 — used for the clock second hand and highlights. */
  accentHue: number;
  /** Colour saturation multiplier, 0.4 – 1.4. */
  intensity: number;
  /** Clock dial style. */
  dial: "white" | "accent" | "mono";
};

export type ThemePreset = {
  id: string;
  label: string;
  hint: string;
  settings: Omit<ThemeSettings, "preset">;
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "mint",
    label: "Mint Ops",
    hint: "Default — mint primary, sky accent",
    settings: { primaryHue: 172, accentHue: 232, intensity: 1, dial: "white" },
  },
  {
    id: "azure",
    label: "Azure Corporate",
    hint: "Cool corporate blue",
    settings: { primaryHue: 245, accentHue: 220, intensity: 0.95, dial: "white" },
  },
  {
    id: "amber",
    label: "Amber Field",
    hint: "Warm high-visibility site theme",
    settings: { primaryHue: 75, accentHue: 45, intensity: 1.1, dial: "accent" },
  },
  {
    id: "violet",
    label: "Violet Executive",
    hint: "Premium violet and rose",
    settings: { primaryHue: 300, accentHue: 340, intensity: 1, dial: "accent" },
  },
  {
    id: "steel",
    label: "Steel Mono",
    hint: "Low-chroma monochrome dial",
    settings: { primaryHue: 220, accentHue: 220, intensity: 0.45, dial: "mono" },
  },
];

export const DEFAULT_THEME: ThemeSettings = {
  preset: "mint",
  ...THEME_PRESETS[0]!.settings,
};

const KEY = "mytime.theme";
const keyFor = (employeeId?: string) => (employeeId ? `${KEY}.${employeeId}` : KEY);

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const ok = (l: number, c: number, h: number) =>
  `oklch(${l.toFixed(3)} ${Math.max(0, c).toFixed(3)} ${((h % 360) + 360) % 360})`;

/** Maps settings to the CSS custom properties consumed across the app. */
export function themeVars(t: ThemeSettings): Record<string, string> {
  const i = clamp(t.intensity, 0.3, 1.5);
  const ph = t.primaryHue;
  const ah = t.accentHue;

  const dialHand =
    t.dial === "accent" ? ok(0.9, 0.09 * i, ah) : t.dial === "mono" ? "oklch(0.86 0.01 250)" : "oklch(0.99 0.004 220)";
  const dialSecond = t.dial === "mono" ? ok(0.78 , 0.06 * i, ah) : ok(0.8, 0.14 * i, ah);

  return {
    "--primary": ok(0.82, 0.15 * i, ph),
    "--primary-glow": ok(0.88, 0.13 * i, ph + 23),
    "--ring": ok(0.82, 0.15 * i, ph),
    "--accent": ok(0.75, 0.13 * i, ah),
    "--success": ok(0.8, 0.14 * i, ph),
    "--clock-hand": dialHand,
    "--clock-tick": dialHand,
    "--clock-second": dialSecond,
    "--gradient-aurora": `linear-gradient(135deg, ${ok(0.82, 0.15 * i, ph)}, ${ok(0.75, 0.13 * i, ah)})`,
  };
}

export function applyTheme(t: ThemeSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(themeVars(t))) root.style.setProperty(k, v);
}

export function loadTheme(employeeId?: string): ThemeSettings {
  if (typeof localStorage === "undefined") return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(keyFor(employeeId)) ?? localStorage.getItem(KEY);
    if (!raw) return DEFAULT_THEME;
    const parsed = JSON.parse(raw) as Partial<ThemeSettings>;
    return {
      ...DEFAULT_THEME,
      ...parsed,
      primaryHue: clamp(Number(parsed.primaryHue ?? DEFAULT_THEME.primaryHue), 0, 360),
      accentHue: clamp(Number(parsed.accentHue ?? DEFAULT_THEME.accentHue), 0, 360),
      intensity: clamp(Number(parsed.intensity ?? 1), 0.3, 1.5),
    };
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveTheme(t: ThemeSettings, employeeId?: string) {
  if (typeof localStorage === "undefined") return;
  try {
    const json = JSON.stringify(t);
    localStorage.setItem(keyFor(employeeId), json);
    localStorage.setItem(KEY, json);
  } catch {
    /* storage unavailable — theme stays for this session only */
  }
}
