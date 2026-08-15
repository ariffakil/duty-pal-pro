import { createFileRoute } from "@tanstack/react-router";

const VOICE_BY_LANG: Record<string, string> = {
  ar: "shimmer",
  hi: "shimmer",
  ur: "shimmer",
  ml: "shimmer",
  fr: "nova",
  tl: "nova",
  en: "nova",
};

export const Route = createFileRoute("/api/nova-tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("Voice service unavailable", { status: 503 });

        let payload: { text?: unknown; lang?: unknown };
        try {
          payload = await request.json();
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }

        const text = typeof payload.text === "string" ? payload.text.trim().slice(0, 1200) : "";
        if (!text) return new Response("Missing text", { status: 400 });
        const lang = typeof payload.lang === "string" ? payload.lang : "en-US";
        const base = lang.split("-")[0] ?? "en";

        const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input: text,
            voice: VOICE_BY_LANG[base] ?? "nova",
            instructions: `Speak naturally in ${lang} like a warm, friendly human workplace assistant. Calm, clear and encouraging, with natural pacing and light intonation. Never sound robotic or monotone.`,
            stream_format: "sse",
            response_format: "pcm",
          }),
        });

        if (!response.ok) {
          const detail = await response.text().catch(() => "");
          return new Response(detail || "TTS failed", { status: response.status });
        }

        return new Response(response.body, {
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
