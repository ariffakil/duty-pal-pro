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
 * Minimal neumorphic wall clock. Face, rings, marks and hands all read from
 * the `--clock-*` design tokens, so it adapts to both light and dark mode.
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

  const hand = (angle: number, length: number, width: number, stroke: string, tail = 4) => {
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      {/* outer soft plate */}
      <circle cx="50" cy="50" r="48" fill="var(--clock-ring)" />
      {/* main dial */}
      <circle cx="50" cy="50" r="40.5" fill="var(--clock-face)" />
      {/* inner disc */}
      <circle cx="50" cy="50" r="21" fill="var(--clock-inner)" />


      {/* four bold marks at 12 / 3 / 6 / 9 */}
      {[0, 90, 180, 270].map((a) => {
        const p1 = polar(a, 36);
        const p2 = polar(a, 29.5);
        return (
          <line
            key={a}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="var(--clock-mark)"
            strokeWidth="1.2"
            strokeLinecap="butt"
          />
        );
      })}

      {/* hands */}
      {hand(h * 30, 21, 1.1, "var(--clock-hand)")}
      {hand(m * 6, 30, 0.9, "var(--clock-hand)")}
      <line
        x1={polar(s * 6, -14).x}
        y1={polar(s * 6, -14).y}
        x2={polar(s * 6, 30).x}
        y2={polar(s * 6, 30).y}
        stroke="#e5342f"
        strokeWidth="0.45"
        strokeLinecap="round"
      />
      <circle cx="50" cy="50" r="1" fill="var(--clock-hand)" />
    </svg>
  );
}
