/** Inline SVG Nova AI avatar with continuously animated eyes and waving hand. */
export function NovaMascot({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Nova AI assistant"
      className={className}
    >
      <defs>
        <linearGradient id="nova-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-card)" />
          <stop offset="100%" stopColor="var(--color-secondary)" />
        </linearGradient>
        <linearGradient id="nova-visor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-accent)" />
        </linearGradient>
      </defs>

      {/* antenna */}
      <line x1="32" y1="9" x2="32" y2="14" stroke="var(--color-primary)" strokeWidth="1.6" />
      <circle cx="32" cy="7.5" r="2.4" fill="var(--color-accent)">
        <animate attributeName="opacity" values="1;0.35;1" dur="1.6s" repeatCount="indefinite" />
      </circle>

      {/* waving hand (left of viewer) */}
      <g className="animate-nova-wave" style={{ transformOrigin: "18px 36px" }}>
        <rect x="12" y="32" width="5" height="10" rx="2.5" fill="url(#nova-body)" stroke="var(--color-border)" strokeWidth="0.8" />
        <circle cx="14.5" cy="30" r="3.4" fill="var(--color-primary)" />
      </g>

      {/* other arm */}
      <rect x="47" y="32" width="5" height="10" rx="2.5" fill="url(#nova-body)" stroke="var(--color-border)" strokeWidth="0.8" />
      <circle cx="49.5" cy="43" r="3" fill="var(--color-accent)" opacity="0.9" />

      {/* head */}
      <rect x="17" y="14" width="30" height="26" rx="12" fill="url(#nova-body)" stroke="var(--color-border)" strokeWidth="1.2" />
      {/* visor */}
      <rect x="21" y="19" width="22" height="15" rx="7.5" fill="url(#nova-visor)" opacity="0.95" />

      {/* eyes + smile */}
      <g className="animate-nova-look">
        <g className="animate-nova-blink" style={{ transformOrigin: "27px 25px" }}>
          <circle cx="27" cy="25" r="2.6" fill="var(--color-background)" />
        </g>
        <g className="animate-nova-blink" style={{ transformOrigin: "37px 25px" }}>
          <circle cx="37" cy="25" r="2.6" fill="var(--color-background)" />
        </g>
        <path
          d="M28 30 Q32 33 36 30"
          fill="none"
          stroke="var(--color-background)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>

      {/* body */}
      <rect x="21" y="41" width="22" height="15" rx="7" fill="url(#nova-body)" stroke="var(--color-border)" strokeWidth="1.2" />
      <circle cx="32" cy="48" r="3" fill="var(--color-primary)">
        <animate attributeName="r" values="2.4;3.4;2.4" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
