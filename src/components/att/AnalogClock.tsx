type Props = {
  /** Time string like "08:34" or "--:--" */
  time: string;
  size?: number;
  tone?: "success" | "accent" | "muted";
};

/** Tiny analog clock face whose hands point at the given time. */
export function AnalogClock({ time, size = 18, tone = "accent" }: Props) {
  const match = /^(\d{1,2}):(\d{2})/.exec(time);
  const h = match ? Number(match[1]) % 12 : 10;
  const m = match ? Number(match[2]) : 10;

  const minuteAngle = m * 6;
  const hourAngle = h * 30 + m * 0.5;

  const color =
    tone === "success"
      ? "var(--color-success)"
      : tone === "muted"
        ? "var(--color-muted-foreground)"
        : "var(--color-accent)";

  const hand = (angle: number, length: number, width: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return (
      <line
        x1={12}
        y1={12}
        x2={12 + Math.cos(rad) * length}
        y2={12 + Math.sin(rad) * length}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
    );
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ opacity: match ? 1 : 0.5 }}
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.6" opacity="0.55" />
      {[0, 90, 180, 270].map((a) => {
        const rad = ((a - 90) * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={12 + Math.cos(rad) * 7.6}
            y1={12 + Math.sin(rad) * 7.6}
            x2={12 + Math.cos(rad) * 9}
            y2={12 + Math.sin(rad) * 9}
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.7"
          />
        );
      })}
      {hand(hourAngle, 4.4, 1.8)}
      {hand(minuteAngle, 6.4, 1.4)}
      <circle cx="12" cy="12" r="1.1" fill={color} />
    </svg>
  );
}
