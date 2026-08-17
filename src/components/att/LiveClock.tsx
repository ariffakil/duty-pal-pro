import { useEffect, useState } from "react";

type Props = {
  size?: number;
  tone?: "primary" | "accent" | "success";
};

/** Modern live analog clock face with ticking hands. */
export function LiveClock({ size = 92, tone = "accent" }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const s = now.getSeconds();
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;

  const color =
    tone === "success"
      ? "var(--color-success)"
      : tone === "primary"
        ? "var(--color-primary)"
        : "var(--color-accent)";

  const hand = (angle: number, length: number, width: number, opacity = 1, stroke = color) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return (
      <line
        x1={50 - Math.cos(rad) * 7}
        y1={50 - Math.sin(rad) * 7}
        x2={50 + Math.cos(rad) * length}
        y2={50 + Math.sin(rad) * length}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        opacity={opacity}
      />
    );
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ filter: `drop-shadow(0 0 12px ${color})` }}
    >
      <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="1.6" opacity="0.35" />
      <circle cx="50" cy="50" r="38" fill="none" stroke={color} strokeWidth="0.8" opacity="0.18" />

      {Array.from({ length: 60 }).map((_, i) => {
        const major = i % 5 === 0;
        const rad = ((i * 6 - 90) * Math.PI) / 180;
        const inner = major ? 33 : 37;
        return (
          <line
            key={i}
            x1={50 + Math.cos(rad) * inner}
            y1={50 + Math.sin(rad) * inner}
            x2={50 + Math.cos(rad) * 41}
            y2={50 + Math.sin(rad) * 41}
            stroke={color}
            strokeWidth={major ? 2.2 : 0.8}
            strokeLinecap="round"
            opacity={major ? 0.85 : 0.3}
          />
        );
      })}

      {hand(h * 30, 21, 4.4)}
      {hand(m * 6, 30, 3)}
      {hand(s * 6, 33, 1.2, 0.9, "var(--color-primary)")}

      <circle cx="50" cy="50" r="3" fill={color} />
      <circle cx="50" cy="50" r="1.2" fill="var(--color-background)" />
    </svg>
  );
}
