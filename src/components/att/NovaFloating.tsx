import { NovaChat, type NovaContext } from "@/components/att/NovaChat";
import { useNovaVoice } from "@/hooks/useNovaVoice";

const DEFAULT_CONTEXT: NovaContext = {
  name: "Ariff",
  site: "Karama Branch, Dubai",
  shift: "08:30 to 18:00",
  clockIn: null,
  clockOut: null,
  clockedOut: false,
  lateMinutes: 0,
  remaining: { h: 0, m: 0, s: 0 },
  nextReminder: "Duty starts at 08:30",
};

/**
 * Screen-level Nova launcher for pages that don't own the shift state.
 * Fixed overlay so the draggable mascot stays reachable everywhere.
 */
export function NovaFloating({ context = DEFAULT_CONTEXT }: { context?: NovaContext }) {
  const { speak, speaking } = useNovaVoice();

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div className="pointer-events-auto contents">
        <NovaChat context={context} onSpeak={speak} speaking={speaking} />
      </div>
    </div>
  );
}
