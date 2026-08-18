import { useEffect, useState } from "react";
import { Check, Palette, RotateCcw, X } from "lucide-react";
import {
  DEFAULT_THEME,
  THEME_PRESETS,
  applyTheme,
  loadTheme,
  saveTheme,
  themeVars,
  type ThemeSettings,
} from "@/lib/theme";

type Props = {
  open: boolean;
  employeeId?: string;
  onClose: () => void;
};

const swatch = (t: ThemeSettings) => {
  const v = themeVars(t);
  return [v["--primary"]!, v["--accent"]!, v["--clock-hand"]!];
};

/** In-app theme editor: presets plus hue / intensity / dial controls. */
export function ThemeSheet({ open, employeeId, onClose }: Props) {
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);

  useEffect(() => {
    if (open) setTheme(loadTheme(employeeId));
  }, [open, employeeId]);

  const update = (patch: Partial<ThemeSettings>) => {
    const next = { ...theme, ...patch };
    setTheme(next);
    applyTheme(next);
    saveTheme(next, employeeId);
  };

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center rounded-[2.4rem] bg-background/70 backdrop-blur-sm">
      <div className="no-scrollbar max-h-[86%] w-full overflow-y-auto rounded-t-[2rem] border border-primary/20 bg-card/95 p-5 shadow-2xl">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/25 bg-secondary/50">
            <Palette className="h-4 w-4 text-primary" />
          </span>
          <div className="flex-1">
            <p className="font-display text-sm font-bold uppercase tracking-wide">Appearance</p>
            <p className="text-[11px] text-muted-foreground">Clock &amp; accent colours</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close appearance settings"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-secondary/40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {THEME_PRESETS.map((p) => {
            const full: ThemeSettings = { preset: p.id, ...p.settings };
            const active = theme.preset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => update(full)}
                className={`rounded-2xl border p-3 text-left transition ${
                  active ? "border-primary/70 bg-secondary/70" : "border-primary/15 bg-secondary/30"
                }`}
              >
                <div className="mb-2 flex items-center gap-1.5">
                  {swatch(full).map((c, i) => (
                    <span
                      key={i}
                      className="h-4 w-4 rounded-full ring-1 ring-black/30"
                      style={{ background: c }}
                    />
                  ))}
                  {active && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
                </div>
                <p className="font-display text-xs font-bold">{p.label}</p>
                <p className="text-[10px] leading-tight text-muted-foreground">{p.hint}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-4">
          <Slider
            label="Primary hue"
            value={theme.primaryHue}
            max={360}
            onChange={(v) => update({ primaryHue: v, preset: "custom" })}
          />
          <Slider
            label="Accent hue"
            value={theme.accentHue}
            max={360}
            onChange={(v) => update({ accentHue: v, preset: "custom" })}
          />
          <Slider
            label="Colour intensity"
            value={Math.round(theme.intensity * 100)}
            min={30}
            max={150}
            suffix="%"
            onChange={(v) => update({ intensity: v / 100, preset: "custom" })}
          />
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Clock dial
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["white", "accent", "mono"] as const).map((d) => (
              <button
                key={d}
                onClick={() => update({ dial: d, preset: "custom" })}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition ${
                  theme.dial === d
                    ? "border-primary/70 bg-secondary/70 text-primary"
                    : "border-primary/15 bg-secondary/30 text-muted-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => update(DEFAULT_THEME)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-secondary/40 py-3 text-xs font-bold uppercase tracking-widest"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset to default
        </button>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  suffix = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="text-[11px] tabular-nums text-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--primary)]"
      />
    </label>
  );
}
