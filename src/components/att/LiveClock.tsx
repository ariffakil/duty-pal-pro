import { useEffect, useMemo, useState } from "react";
import { dutyGradient, resolveDuty } from "@/lib/dutyRoster";

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

/**
 * Minimalist luxury wall clock: matte black dial, brass ball hour markers and
 * slim brass hands. The employee's duty window is drawn as a subtle arc.
 */
export function LiveClock({
  size = 92,
  dutyStartMin,
  dutyEndMin,
  showDuty = true,
}: Props) {
  const [now, setNow] = useState(() => new Date(2020, 0, 1, 0, 0, 0));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const duty = useMemo(() => resolveDuty(now), [now.getMinutes(), now.getHours()]);
  const start = dutyStartMin ?? duty.window?.startMin;
  const end = dutyEndMin ?? duty.window?.endMin;
  const [g0, g1] = dutyGradient(duty.phase);
  const hasDuty = mounted && showDuty && start != null && end != null;

  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const elapsedEnd =
    start != null && end != null && duty.phase === "active" ? Math.min(nowMin, end) : null;

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
        <linearGradient id="lc-duty" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={g0} />
          <stop offset="100%" stopColor={g1} />
        </linearGradient>
        <radialGradient id="lc-face" cx="35%" cy="26%" r="85%">
          <stop offset="0%" stopColor="#2a2c31" />
          <stop offset="55%" stopColor="#17181c" />
          <stop offset="100%" stopColor="#0b0c0e" />
        </radialGradient>
        <radialGradient id="lc-ball" cx="34%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff4cf" />
          <stop offset="55%" stopColor={brass} />
          <stop offset="100%" stopColor="#8d7539" />
        </radialGradient>
        <linearGradient id="lc-hand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f4e6bd" />
          <stop offset="100%" stopColor="#bda56b" />
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
            <circle cx={p.x} cy={p.y + 0.5} r={1.9} fill="#000" opacity="0.5" />
            <circle cx={p.x} cy={p.y} r={1.9} fill="url(#lc-ball)" />
          </g>
        );
      })}

      {/* Hands */}
      <g style={{ filter: "drop-shadow(0 1.5px 2px rgba(0,0,0,0.7))" }}>
        {hand(h * 30, 24, 2.2, "url(#lc-hand)")}
        {hand(m * 6, 35, 1.8, "url(#lc-hand)")}
        {hand(s * 6, 38, 0.7, brass, 11)}
      </g>

      <circle cx="50" cy="50" r="2.2" fill="url(#lc-ball)" />
    </svg>
  );
}
