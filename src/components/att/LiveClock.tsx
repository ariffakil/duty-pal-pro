import { useEffect, useState } from "react";

type Props = {
  size?: number;
  tone?: "primary" | "accent" | "success";
  dutyStartMin?: number;
  dutyEndMin?: number;
  showDuty?: boolean;
};

const polar = (angleDeg: number, r: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: 50 + Math.cos(rad) * r, y: 50 + Math.sin(rad) * r };
};

/**
 * Minimalist luxury wall clock: matte black dial, brass ball hour markers and
 * slim brass hands.
 */
export function LiveClock({ size = 92 }: Props) {
  const [now, setNow] = useState(() => new Date(2020, 0, 1, 0, 0, 0));

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const s = now.getSeconds();
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;

  const brass = "#d9c48a";

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
        strokeLinecap="butt"
      />
    );
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>

        <radialGradient id="lc-face" cx="35%" cy="26%" r="85%">
          <stop offset="0%" stopColor="var(--background)" />
          <stop offset="55%" stopColor="var(--background)" />
          <stop offset="100%" stopColor="var(--background)" />
        </radialGradient>
        <radialGradient id="lc-ball" cx="34%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f2f2f2" />
          <stop offset="100%" stopColor="#c9c9c9" />
        </radialGradient>
        <linearGradient id="lc-hand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8e8e8" />
        </linearGradient>
      </defs>

      {/* Matte black dial */}
      <circle cx="50" cy="50" r="49" fill="url(#lc-face)" />
      <circle cx="50" cy="50" r="48.4" fill="none" stroke="#000" strokeOpacity="0.6" strokeWidth="1.2" />




      {/* Brass ball hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const p = polar(i * 30, 39.5);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y + 0.4} r={1.1} fill="#000" opacity="0.5" />
            <circle cx={p.x} cy={p.y} r={1.1} fill="url(#lc-ball)" />
          </g>
        );
      })}

      {/* Hands */}
      <g style={{ filter: "drop-shadow(0 1.5px 2px rgba(0,0,0,0.7))" }}>
        {hand(h * 30, 24, 2.2, "url(#lc-hand)")}
        {hand(m * 6, 35, 1.8, "url(#lc-hand)")}
        {hand(s * 6, 38, 0.7, "#e5342f", 11)}
      </g>

      <circle cx="50" cy="50" r="2.2" fill="url(#lc-ball)" />
    </svg>
  );
}
