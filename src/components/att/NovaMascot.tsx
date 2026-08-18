type Props = {
  className?: string;
  /** Animates the mouth as if talking. */
  speaking?: boolean;
  /** Pulses the ear rings as if listening. */
  listening?: boolean;
};

/**
 * Inline SVG Nova AI avatar: white robot with continuously animated eyes,
 * mouth and both hands. Eyes blink and glance around, the mouth talks while
 * Nova speaks and both arms move independently.
 */
export function NovaMascot({ className = "", speaking = false, listening = false }: Props) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Nova AI assistant" className={className}>
      <defs>
        <linearGradient id="nova-shell" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#eef2f7" />
          <stop offset="100%" stopColor="#cfd8e3" />
        </linearGradient>
        <linearGradient id="nova-visor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1b2432" />
          <stop offset="100%" stopColor="#0b1119" />
        </linearGradient>
        <radialGradient id="nova-eye" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#eafcff" />
          <stop offset="60%" stopColor="#5cd9ff" />
          <stop offset="100%" stopColor="#1e9fd8" />
        </radialGradient>
      </defs>

      {/* antenna */}
      <line x1="32" y1="8" x2="32" y2="13" stroke="#cfd8e3" strokeWidth="1.6" />
      <circle cx="32" cy="6.6" r="2.4" fill="#5cd9ff">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
        <animate attributeName="r" values="2.1;2.8;2.1" dur="1.4s" repeatCount="indefinite" />
      </circle>

      {/* arms: both animated, opposite phase */}
      <g className="animate-nova-wave" style={{ transformOrigin: "18px 38px" }}>
        <rect x="12" y="34" width="5" height="10" rx="2.5" fill="url(#nova-shell)" stroke="#b9c4d2" strokeWidth="0.7" />
        <circle cx="14.5" cy="31.5" r="3.4" fill="url(#nova-shell)" stroke="#b9c4d2" strokeWidth="0.7" />
      </g>
      <g className="animate-nova-wave-alt" style={{ transformOrigin: "49px 38px" }}>
        <rect x="47" y="34" width="5" height="10" rx="2.5" fill="url(#nova-shell)" stroke="#b9c4d2" strokeWidth="0.7" />
        <circle cx="49.5" cy="45" r="3.2" fill="url(#nova-shell)" stroke="#b9c4d2" strokeWidth="0.7" />
      </g>

      {/* head with gentle bob */}
      <g className="animate-nova-bob" style={{ transformOrigin: "32px 40px" }}>
        {/* ears */}
        <circle cx="16.5" cy="26" r="2.6" fill="#dfe6ee" stroke="#b9c4d2" strokeWidth="0.6">
          {listening && (
            <animate attributeName="opacity" values="1;0.35;1" dur="0.9s" repeatCount="indefinite" />
          )}
        </circle>
        <circle cx="47.5" cy="26" r="2.6" fill="#dfe6ee" stroke="#b9c4d2" strokeWidth="0.6">
          {listening && (
            <animate attributeName="opacity" values="0.35;1;0.35" dur="0.9s" repeatCount="indefinite" />
          )}
        </circle>

        <rect x="18" y="13" width="28" height="26" rx="12" fill="url(#nova-shell)" stroke="#b9c4d2" strokeWidth="1" />
        <rect x="21" y="17" width="22" height="17" rx="8.5" fill="url(#nova-visor)" />

        {/* eyes + mouth */}
        <g className="animate-nova-look">
          <g className="animate-nova-blink" style={{ transformOrigin: "27px 24px" }}>
            <circle cx="27" cy="24" r="3" fill="url(#nova-eye)" />
          </g>
          <g className="animate-nova-blink" style={{ transformOrigin: "37px 24px" }}>
            <circle cx="37" cy="24" r="3" fill="url(#nova-eye)" />
          </g>

          {speaking ? (
            <ellipse cx="32" cy="30" rx="3.6" ry="1.6" fill="#5cd9ff" className="animate-nova-talk" style={{ transformOrigin: "32px 30px" }} />
          ) : (
            <path d="M28.5 29.4 Q32 32 35.5 29.4" fill="none" stroke="#5cd9ff" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </g>
      </g>

      {/* body */}
      <rect x="21" y="41" width="22" height="16" rx="7.5" fill="url(#nova-shell)" stroke="#b9c4d2" strokeWidth="1" />
      <circle cx="32" cy="49" r="3" fill="#5cd9ff" opacity="0.9">
        <animate attributeName="r" values="2.3;3.4;2.3" dur="2.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
