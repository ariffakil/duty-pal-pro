import { useEffect, useMemo, useState } from "react";
import { dutyGradient, fmtMin, resolveDuty } from "@/lib/dutyRoster";

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
 * Minimal ring clock: a thin dial where the employee's duty window is drawn
 * as a bright gradient arc over the dim base ring.
 */
export function LiveClock({
  size = 92,
  dutyStartMin,
  dutyEndMin,
  showDuty = true,
}: Props) {
  // Start from a fixed time so SSR and the first client render match, then
  // switch to the real clock after mount.
  const [now, setNow] = useState(() => new Date(2020, 0, 1, 0, 0, 0));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Real duty window for today — or tomorrow's once today's shift is done.
  const duty = useMemo(() => resolveDuty(now), [now.getMinutes(), now.getHours()]);
  const start = dutyStartMin ?? duty.window?.startMin;
  const end = dutyEndMin ?? duty.window?.endMin;
  const [g0, g1] = dutyGradient(duty.phase);
  const hasDuty = mounted && showDuty && start != null && end != null;

  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const elapsedEnd =
    start != null && end != null && duty.phase === "active"
      ? Math.min(nowMin, end)
      : null;

  const s = now.getSeconds();
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;

  const hand = (angle: number, length: number, width: number, stroke: string, tail = 6) => {
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

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="lc-duty" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={g0} />
          <stop offset="100%" stopColor={g1} />
        </linearGradient>
      </defs>

      {/* Base dial ring */}
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="var(--color-foreground)"
        strokeWidth="1.4"
        opacity="0.35"
      />

      {/* Duty-hours arc */}
      {hasDuty && (
        <>
          <path
            d={arcPath(start!, end!, 42)}
            fill="none"
            stroke="url(#lc-duty)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.12"
          />
          <path
            d={arcPath(start!, end!, 42)}
            fill="none"
            stroke="url(#lc-duty)"
            strokeDasharray={duty.phase === "tomorrow" ? "3 3" : undefined}
            opacity={duty.phase === "tomorrow" ? 0.75 : 1}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Minor tick marks */}
      {Array.from({ length: 12 }).map((_, i) => {
        if (i % 3 === 0) return null;
        const a = i * 30;
        const p0 = polar(a, 34);
        const p1 = polar(a, 29);
        return (
          <line
            key={i}
            x1={p0.x}
            y1={p0.y}
            x2={p1.x}
            y2={p1.y}
            stroke="var(--color-foreground)"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.55"
          />
        );
      })}

      {/* Numerals */}
      {[
        { n: 12, a: 0 },
        { n: 3, a: 90 },
        { n: 6, a: 180 },
        { n: 9, a: 270 },
      ].map(({ n, a }) => {
        const p = polar(a, 31);
        return (
          <text
            key={n}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="9"
            fontWeight="500"
            fill="var(--color-foreground)"
          >
            {n}
          </text>
        );
      })}

      {/* Inner duty ring — today's actual duty window, filled as it elapses */}
      {hasDuty && (
        <>
          <path
            d={arcPath(start!, end!, 26)}
            fill="none"
            stroke="var(--color-success)"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.28"
          />
          {elapsedEnd != null && elapsedEnd > start! && (
            <path
              d={arcPath(start!, elapsedEnd, 26)}
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )}
          <text
            x="50"
            y="68"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="6"
            fontWeight="600"
            letterSpacing="0.4"
            fill="var(--color-success)"
            opacity="0.9"
          >
            {`${fmtMin(start!)} – ${fmtMin(end!)}`}
          </text>
        </>
      )}

      {/* Hands */}
      {hand(h * 30, 22, 1.5, "var(--color-foreground)")}
      {hand(m * 6, 32, 1.1, "var(--color-foreground)")}
      {hand(s * 6, 35, 0.5, "var(--color-foreground)", 4)}

      <circle cx="50" cy="50" r="2.4" fill="var(--color-background)" stroke="var(--color-foreground)" strokeWidth="0.9" />
    </svg>
  );
}
