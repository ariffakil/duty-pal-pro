import { useEffect, useState } from "react";

type Props = {
  size?: number;
  tone?: "primary" | "accent" | "success";
  /** Duty window in minutes from midnight — highlighted on the dial. */
  dutyStartMin?: number;
  dutyEndMin?: number;
  showDuty?: boolean;
};

const polar = (angleDeg: number, r: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: 50 + Math.cos(rad) * r, y: 50 + Math.sin(rad) * r };
};

/** Angle on a 12-hour dial for a minutes-from-midnight value. */
const dialAngle = (min: number) => ((min % 720) / 720) * 360;

function arcPath(startMin: number, endMin: number, r: number) {
  const a0 = dialAngle(startMin);
  let sweep = dialAngle(endMin) - a0;
  if (sweep <= 0) sweep += 360;
  const p0 = polar(a0, r);
  const p1 = polar(a0 + sweep, r);
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${p1.x} ${p1.y}`;
}

/** Modern dark analog clock face with ticking hands and a duty-hours arc. */
export function LiveClock({
  size = 92,
  tone = "accent",
  dutyStartMin = 8 * 60 + 30,
  dutyEndMin = 18 * 60 + 30,
  showDuty = true,
}: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const s = now.getSeconds();
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;

  const duty =
    tone === "success"
      ? "var(--color-success)"
      : tone === "primary"
        ? "var(--color-primary)"
        : "var(--color-accent)";

  const hand = (angle: number, length: number, width: number, stroke: string, tail = 8) => {
    const a = polar(angle, -tail);
    const b = polar(angle, length);
    return (
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
      />
    );
  };

  const numerals: Array<[string, number]> = [
    ["12", 0],
    ["3", 90],
    ["6", 180],
    ["9", 270],
  ];

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="lc-face" cx="38%" cy="32%" r="78%">
          <stop offset="0%" stopColor="var(--color-secondary)" />
          <stop offset="100%" stopColor="var(--color-background)" />
        </radialGradient>
      </defs>

      {/* Soft neumorphic body */}
      <circle cx="50" cy="50" r="47" fill="url(#lc-face)" />
      <circle cx="50" cy="50" r="47" fill="none" stroke="var(--color-border)" strokeWidth="0.8" opacity="0.6" />

      {/* Duty-hours arc */}
      {showDuty && (
        <>
          <path
            d={arcPath(dutyStartMin, dutyEndMin, 43)}
            fill="none"
            stroke={duty}
            strokeWidth="3.4"
            strokeLinecap="round"
            opacity="0.9"
            style={{ filter: `drop-shadow(0 0 4px ${duty})` }}
          />
          <path
            d={arcPath(dutyStartMin, dutyEndMin, 43)}
            fill="none"
            stroke={duty}
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.12"
          />
        </>
      )}

      {/* Minute ticks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const major = i % 5 === 0;
        if (i % 15 === 0) return null;
        const a = i * 6;
        const p0 = polar(a, major ? 32 : 35.5);
        const p1 = polar(a, 38);
        return (
          <line
            key={i}
            x1={p0.x}
            y1={p0.y}
            x2={p1.x}
            y2={p1.y}
            stroke="var(--color-muted-foreground)"
            strokeWidth={major ? 1.6 : 0.7}
            strokeLinecap="round"
            opacity={major ? 0.7 : 0.28}
          />
        );
      })}

      {/* Numerals */}
      {numerals.map(([label, a]) => {
        const p = polar(a, 33);
        return (
          <text
            key={label}
            x={p.x}
            y={p.y + 3.6}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="var(--color-muted-foreground)"
            opacity="0.85"
          >
            {label}
          </text>
        );
      })}

      {/* Hands */}
      {hand(h * 30, 20, 4, "var(--color-destructive)")}
      {hand(m * 6, 29, 1.4, "var(--color-foreground)", 6)}
      {hand(s * 6, 26, 2, "var(--color-destructive)", 10)}

      <circle cx="50" cy="50" r="3.2" fill="var(--color-foreground)" />
    </svg>
  );
}
