import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronLeft, Shield, Wifi } from "lucide-react";

import { FaceScan } from "@/components/att/FaceScan";
import { AttendanceResult } from "@/components/att/AttendanceResult";
import { ShiftDashboard } from "@/components/att/ShiftDashboard";
import { AiBuddy, type BuddyMessage } from "@/components/att/AiBuddy";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nova Attend — Face Attendance & Access Control" },
      {
        name: "description",
        content:
          "Face-verified time attendance and access control app with live shift countdown and an AI shift buddy.",
      },
      { property: "og:title", content: "Nova Attend — Face Attendance & Access Control" },
      {
        property: "og:description",
        content:
          "Mark attendance with face verification, track clock in / clock out and get AI shift reminders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SHIFT_HOURS = 9;
const SHIFT_START_MIN = 10 * 60; // 10:00

const fmt = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

type Stage = "idle" | "scanning" | "verified" | "day";

function Index() {
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [clockInAt, setClockInAt] = useState<Date | null>(null);
  const [clockedOut, setClockedOut] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [messages, setMessages] = useState<BuddyMessage[]>([
    { id: 1, text: "Good morning, Ariff. Your duty starts at 10:00 in Karama, Dubai.", tone: "info" },
    { id: 2, text: "Traffic looks light — leave in 15 minutes to stay on time.", tone: "nudge" },
  ]);
  const msgId = useRef(2);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);


  const push = useCallback((text: string, tone: BuddyMessage["tone"] = "info") => {
    msgId.current += 1;
    setMessages((m) => [...m, { id: msgId.current, text, tone }]);
  }, []);

  const startScan = () => {
    setStage("scanning");
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          return 100;
        }
        return p + 4;
      });
    }, 70);
    setTimeout(() => {
      const at = new Date();
      setClockInAt(at);
      setStage("verified");
      const late = at.getHours() * 60 + at.getMinutes() - SHIFT_START_MIN;
      push(
        late > 0
          ? `Attendance marked at ${fmt(at)} — you are late by ${late} minutes. I logged the reason field for you.`
          : `Attendance marked at ${fmt(at)} — you are on time. Great start!`,
        late > 0 ? "nudge" : "cheer",
      );
    }, 2000);
  };

  const clockOutAt = useMemo(
    () => (clockInAt ? new Date(clockInAt.getTime() + SHIFT_HOURS * 3600_000) : null),
    [clockInAt],
  );

  const lateMinutes = clockInAt
    ? Math.max(0, clockInAt.getHours() * 60 + clockInAt.getMinutes() - SHIFT_START_MIN)
    : 0;

  const totalMs = SHIFT_HOURS * 3600_000;
  const elapsed =
    clockInAt && now ? Math.min(totalMs, now.getTime() - clockInAt.getTime()) : 0;

  const leftMs = Math.max(0, totalMs - elapsed);
  const remaining = {
    h: Math.floor(leftMs / 3600_000),
    m: Math.floor((leftMs % 3600_000) / 60_000),
    s: Math.floor((leftMs % 60_000) / 1000),
  };

  useEffect(() => {
    if (stage !== "day") return;
    const stand = setTimeout(
      () => push("You've been seated for 50 minutes — stand up and stretch for 2 minutes.", "nudge"),
      9000,
    );
    const evening = setTimeout(
      () => push("Good evening! 30 minutes left on your shift. Wrap up your tasks.", "info"),
      18000,
    );
    return () => {
      clearTimeout(stand);
      clearTimeout(evening);
    };
  }, [stage, push]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] halo" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-10 px-6 py-12 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-md text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" /> Time Attendance &amp; Access Control
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Face-verified attendance with an <span className="gradient-text">AI shift buddy</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Employees clock in with a liveness-checked face scan, the server confirms the site
            geofence, and Nova keeps the day on track with live countdowns and smart reminders.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4 text-left">
            {[
              ["<1.2s", "Face match"],
              ["99.4%", "Accuracy"],
              ["24/7", "AI buddy"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="text-2xl font-semibold">{v}</dt>
                <dd className="text-xs uppercase tracking-wider text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="relative">
          <div
            className="relative w-[380px] max-w-full rounded-[2.6rem] border border-border p-3"
            style={{
              backgroundImage: "var(--gradient-surface)",
              boxShadow: "var(--shadow-elevated)",
            }}
          >
            <div className="relative max-h-[780px] overflow-y-auto rounded-[2.1rem] bg-background">
              <div className="flex items-center justify-between px-6 pt-4 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{now ? fmt(now) : "--:--"}</span>
                <span className="flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5" /> 5G
                </span>
              </div>

              <header className="flex items-center gap-3 px-6 pb-2 pt-5">
                {stage === "day" ? (
                  <button
                    onClick={() => setStage("verified")}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary/50"
                    aria-label="Back"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold text-primary-foreground"
                    style={{ backgroundImage: "var(--gradient-aurora)" }}
                  >
                    AM
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold">Ariff Mohamed</p>
                  <p className="text-xs text-muted-foreground">Site Engineer · EMP-2481</p>
                </div>
                <button
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary/50"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
                </button>
              </header>

              {stage === "idle" || stage === "scanning" ? (
                <FaceScan status={stage} progress={progress} onScan={startScan} />
              ) : stage === "verified" ? (
                <AttendanceResult
                  clockIn={clockInAt ? fmt(clockInAt) : "10:30"}
                  location="Karama, Dubai · Head Office"
                  lateMinutes={lateMinutes}
                  onContinue={() => setStage("day")}
                />
              ) : (
                <ShiftDashboard
                  clockIn={clockInAt ? fmt(clockInAt) : "--:--"}
                  clockOut={clockOutAt ? fmt(clockOutAt) : "--:--"}
                  remaining={remaining}
                  percent={elapsed / totalMs}
                  lateMinutes={lateMinutes}
                  clockedOut={clockedOut}
                  onClockOut={() => {
                    setClockedOut(true);
                    push("Clock out verified. Have a great evening, Sir!", "cheer");
                  }}
                />
              )}

              <AiBuddy messages={messages} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
