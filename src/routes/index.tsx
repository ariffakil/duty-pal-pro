import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronLeft, ShieldCheck, Wifi } from "lucide-react";
import mytimeLogo from "@/assets/mytime-logo.png.asset.json";


import { FaceScan } from "@/components/att/FaceScan";
import { AttendanceResult } from "@/components/att/AttendanceResult";
import { ShiftDashboard } from "@/components/att/ShiftDashboard";
import { DaySummary } from "@/components/att/DaySummary";

import { AiBuddy, type BuddyMessage } from "@/components/att/AiBuddy";
import { NovaAvatar } from "@/components/att/NovaAvatar";
import { NovaChat } from "@/components/att/NovaChat";
import { NovaRequestSheet, type RequestKind } from "@/components/att/NovaRequestSheet";
import { submitStaffRequest } from "@/lib/requests.functions";
import { useNovaVoice } from "@/hooks/useNovaVoice";
import { setNovaEmployee } from "@/lib/novaLang";
import { PeriodSummary, type PeriodDay } from "@/components/att/PeriodSummary";
import {
  buildMonthReport,
  buildWeekReport,
  isLastPunchOfMonth,
  isLastPunchOfWeek,
} from "@/lib/periodReport";


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

/** Signed-in employee on this device. */
const EMPLOYEE = { id: "EMP-1042", name: "Ariff" };

const SHIFT_HOURS = 9;
const SHIFT_START_MIN = 10 * 60; // 10:00

const fmt = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

type Stage = "idle" | "scanning" | "verified" | "day" | "summary" | "period";

function Index() {
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [clockInAt, setClockInAt] = useState<Date | null>(null);
  const [clockedOut, setClockedOut] = useState(false);
  const [actualOutAt, setActualOutAt] = useState<Date | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [requestKind, setRequestKind] = useState<RequestKind | null>(null);
  const askedRef = useRef<{ late: boolean; leave: boolean }>({ late: false, leave: false });
  const lateMinutesRef = useRef(0);
  const [period, setPeriod] = useState<{
    scope: "week" | "month";
    title: string;
    range: string;
    days: PeriodDay[];
  } | null>(null);



  const [messages, setMessages] = useState<BuddyMessage[]>([
    {
      id: 1,
      text: "Good morning, Alex. Today your duty schedule is 08:30 to 18:00 at Karama Branch.",
      tone: "info",
    },
    { id: 2, text: "Only 10 minutes remaining to clock in. Shall we scan your face?", tone: "nudge" },
  ]);
  const msgId = useRef(2);
  const { speak, enabled: voiceOn, toggle: toggleVoice, speaking } = useNovaVoice();

  // Nova remembers each signed-in employee's language on this device.
  useEffect(() => {
    setNovaEmployee(EMPLOYEE.id);
  }, []);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const latest = messages[messages.length - 1];

  const push = useCallback(
    (text: string, tone: BuddyMessage["tone"] = "info") => {
      msgId.current += 1;
      setMessages((m) => [...m, { id: msgId.current, text, tone }]);
      speak(text);
    },
    [speak],
  );

  // Daily 06:00 morning briefing — spoken once per day, per employee, per device.
  useEffect(() => {
    const KEY = `nova.morningBriefing.${EMPLOYEE.id}`;
    const check = () => {
      const d = new Date();
      const today = d.toDateString();
      if (d.getHours() < 6) return;
      // Keep it a morning greeting (06:00 - 09:59 window).
      if (d.getHours() >= 10) return;
      try {
        if (localStorage.getItem(KEY) === today) return;
        localStorage.setItem(KEY, today);
      } catch {
        return;
      }
      push(
        `Good morning ${EMPLOYEE.name}. Your duty hours today are morning 8:30 to evening 6:30 at Karama Branch.`,
        "info",
      );
    };
    check();
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
  }, [push]);


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
          ? `Thank you Sir. Your attendance is marked at ${fmt(at)} at Karama Branch. You are late today by ${String(Math.floor(late / 60)).padStart(2, "0")}:${String(late % 60).padStart(2, "0")} minutes.`
          : `Thank you Sir. Your attendance is marked at ${fmt(at)} at Karama Branch. You are on time today.`,
        late > 0 ? "nudge" : "cheer",
      );
      if (late > 30 && !askedRef.current.late) {
        askedRef.current.late = true;
        // Queue it — it only opens once the thank-you message is done.
        setPendingRequest("late");
      }

    }, 2000);
  };

  const sendRequest = useCallback(
    async (kind: RequestKind, reason: string) => {
      const res = await submitStaffRequest({
        data: {
          kind,
          employeeId: EMPLOYEE.id,
          employeeName: EMPLOYEE.name,
          reason,
          lateMinutes: kind === "late" ? lateMinutesRef.current : 0,
          at: new Date().toISOString(),
        },
      });
      push(
        kind === "late"
          ? `Your late reason has been sent to your Manager and HR. Reference ${res.reference}.`
          : `Your leave request has been sent to your Manager and HR. Reference ${res.reference}.`,
        "info",
      );
      return { reference: res.reference, notified: res.notified };
    },
    [push],
  );


  const clockOutAt = useMemo(
    () => (clockInAt ? new Date(clockInAt.getTime() + SHIFT_HOURS * 3600_000) : null),
    [clockInAt],
  );

  const lateMinutes = clockInAt
    ? Math.max(0, clockInAt.getHours() * 60 + clockInAt.getMinutes() - SHIFT_START_MIN)
    : 0;
  lateMinutesRef.current = lateMinutes;

  // Not clocked in more than an hour after shift start → offer a leave request.
  useEffect(() => {
    if (!now || clockInAt || askedRef.current.leave) return;
    const mins = now.getHours() * 60 + now.getMinutes() - SHIFT_START_MIN;
    if (mins < 60) return;
    askedRef.current.leave = true;
    push(
      "You have not clocked in for more than an hour. Would you like to write a leave request to your Manager?",
      "nudge",
    );
    setRequestKind("leave");
  }, [now, clockInAt, push]);



  const totalMs = SHIFT_HOURS * 3600_000;
  const elapsed =
    clockInAt && now ? Math.min(totalMs, now.getTime() - clockInAt.getTime()) : 0;

  const leftMs = Math.max(0, totalMs - elapsed);
  const remaining = {
    h: Math.floor(leftMs / 3600_000),
    m: Math.floor((leftMs % 3600_000) / 60_000),
    s: Math.floor((leftMs % 60_000) / 1000),
  };

  // Total worked for the day.
  const workedMs =
    clockInAt && actualOutAt ? Math.max(0, actualOutAt.getTime() - clockInAt.getTime()) : 0;
  const workedText = `${String(Math.floor(workedMs / 3600_000)).padStart(2, "0")}h ${String(
    Math.floor((workedMs % 3600_000) / 60_000),
  ).padStart(2, "0")}m`;
  const overtimeMs = Math.max(0, workedMs - SHIFT_HOURS * 3600_000);
  const overtimeText = `${String(Math.floor(overtimeMs / 3600_000)).padStart(2, "0")}h ${String(
    Math.floor((overtimeMs % 3600_000) / 60_000),
  ).padStart(2, "0")}m`;

  // Auto-close verification / day-summary popups once Nova finishes speaking.
  const spokeRef = useRef(false);
  useEffect(() => {
    if (stage !== "verified" && stage !== "summary") {
      spokeRef.current = false;
      return;
    }
    if (speaking) {
      spokeRef.current = true;
      return;
    }
    const wasSummary = stage === "summary";
    const t = setTimeout(
      () => {
        if (wasSummary) {
          if (period) {
            // Weekly / monthly attendance report on the last punch out.
            setStage("period");
            return;
          }
          // Shift finished: return to the home screen ready for the next day.
          setStage("idle");
          setClockInAt(null);
          setActualOutAt(null);
          setClockedOut(false);
          setProgress(0);
        } else {
          setStage("day");
        }
      },
      spokeRef.current ? 1200 : 6000,
    );
    return () => clearTimeout(t);
  }, [stage, speaking, period]);



  useEffect(() => {
    if (stage !== "day") return;

    const stand = setTimeout(
      () => push("You've been seated for 50 minutes. Please stand up and stretch for 2 minutes.", "nudge"),
      9000,
    );
    const evening = setTimeout(
      () => push("Good evening. Your duty ends in 00:30 minutes. Please wrap up your tasks.", "info"),
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

      <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-4 py-8">
        <section className="relative flex flex-col items-center">
          <div
            className="relative w-[390px] max-w-full rounded-[3rem] border-[8px] border-secondary p-0"
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            <div className="no-scrollbar relative flex max-h-[812px] min-h-[812px] flex-col overflow-y-auto rounded-[2.4rem] bg-background">
              <div className="flex items-center justify-between px-8 pt-6 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{now ? fmt(now) : "--:--"}</span>
                <span className="flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5" /> 5G
                </span>
              </div>

              <div className="flex items-center px-6 pt-3">
                <img
                  src={mytimeLogo.url}
                  alt="MyTime Cloud logo"
                  className="h-9 w-auto max-w-[190px] object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]"
                />
              </div>


              <header className="flex items-center gap-3 px-6 pb-1 pt-4">
                {stage === "day" ? (
                  <button
                    onClick={() => setStage("verified")}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/25 bg-secondary/40"
                    aria-label="Back"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 font-display text-sm font-bold text-primary-foreground"
                    style={{ backgroundImage: "var(--gradient-aurora)" }}
                  >
                    AM
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-display text-base font-bold uppercase tracking-wide text-accent">
                    Ariff Mohamed
                  </p>
                  <p className="text-xs text-muted-foreground">Site Engineer · EMP-2481</p>
                </div>
                <span className="rounded-full border border-primary/25 bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                  {clockedOut ? "Closed" : clockInAt ? "On duty" : "Active"}
                </span>
                <button
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-secondary/40"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
                </button>
              </header>


              <NovaAvatar
                text={latest?.text ?? ""}
                tone={latest?.tone ?? "info"}
                speaking={speaking}
                voiceOn={voiceOn}
                onToggleVoice={toggleVoice}
                onReplay={() => latest && speak(latest.text)}
              />

              {stage === "idle" || stage === "scanning" ? (
                <FaceScan status={stage} progress={progress} onScan={startScan} />
              ) : stage === "verified" ? (
                <AttendanceResult
                  clockIn={clockInAt ? fmt(clockInAt) : "10:30"}
                  location="Karama, Dubai · Head Office"
                  lateMinutes={lateMinutes}
                  onContinue={() => setStage("day")}
                />
              ) : stage === "summary" ? (
                <DaySummary
                  clockIn={clockInAt ? fmt(clockInAt) : "--:--"}
                  clockOut={actualOutAt ? fmt(actualOutAt) : "--:--"}
                  totalWorked={workedText}
                  overtime={overtimeText}
                  lateMinutes={lateMinutes}
                  onDone={() => {
                    setStage("idle");
                    setClockInAt(null);
                    setActualOutAt(null);
                    setClockedOut(false);
                    setProgress(0);
                  }}

                />
              ) : stage === "period" && period ? (
                <PeriodSummary
                  scope={period.scope}
                  title={period.title}
                  range={period.range}
                  days={period.days}
                  onDone={() => {
                    setPeriod(null);
                    setStage("idle");
                    setClockInAt(null);
                    setActualOutAt(null);
                    setClockedOut(false);
                    setProgress(0);
                  }}
                />
              ) : (
                <ShiftDashboard
                  clockIn={clockInAt ? fmt(clockInAt) : "--:--"}
                  clockOut={
                    actualOutAt ? fmt(actualOutAt) : clockOutAt ? fmt(clockOutAt) : "--:--"
                  }
                  remaining={remaining}
                  percent={elapsed / totalMs}
                  lateMinutes={lateMinutes}
                  clockedOut={clockedOut}
                  onClockOut={() => {
                    const out = new Date();
                    const ms = clockInAt ? Math.max(0, out.getTime() - clockInAt.getTime()) : 0;
                    const h = Math.floor(ms / 3600_000);
                    const m = Math.floor((ms % 3600_000) / 60_000);
                    setActualOutAt(out);
                    setClockedOut(true);
                    setStage("summary");
                    push(
                      `You have successfully clocked out at ${fmt(out)}. Here is your summary for the day. Total working hours ${clockInAt ? fmt(clockInAt) : "08:34"} to ${fmt(out)}, that is ${h} hours and ${m} minutes. Have a great evening, Sir!`,
                      "cheer",
                    );

                    // Last punch out of the week / month → period attendance report.
                    const today = {
                      in: clockInAt ? fmt(clockInAt) : fmt(out),
                      out: fmt(out),
                      hours: Math.round((ms / 3600_000) * 10) / 10,
                      late: lateMinutes,
                    };
                    const monthEnd = isLastPunchOfMonth(out);
                    const weekEnd = isLastPunchOfWeek(out);
                    if (monthEnd || weekEnd) {
                      const report = monthEnd
                        ? buildMonthReport(out, today)
                        : buildWeekReport(out, today);
                      setPeriod({
                        scope: monthEnd ? "month" : "week",
                        title: monthEnd ? "Monthly attendance report" : "Weekly attendance report",
                        range: report.range,
                        days: report.days,
                      });
                      setTimeout(() => {
                        push(
                          monthEnd
                            ? "Here is your monthly attendance summary report. Please review your total hours, overtime and late days for this month."
                            : "It is the end of your work week. Here is your weekly attendance summary report.",
                          "info",
                        );
                      }, 1200);
                    }
                  }}
                />
              )}


              <AiBuddy messages={messages} />

              {requestKind && (
                <NovaRequestSheet
                  kind={requestKind}
                  lateMinutes={lateMinutes}
                  onClose={() => setRequestKind(null)}
                  onSubmit={(reason) => sendRequest(requestKind, reason)}
                />
              )}

            </div>

            <NovaChat
              context={{
                name: "Ariff",
                site: "Karama Branch, Dubai",
                shift: "08:30 to 18:00",
                clockIn: clockInAt ? fmt(clockInAt) : null,
                clockOut: clockOutAt ? fmt(clockOutAt) : null,
                clockedOut,
                lateMinutes,
                remaining,
                nextReminder: clockedOut
                  ? "Tomorrow 08:00 — duty starts at 08:30"
                  : clockInAt
                    ? "Stand up and stretch in 10 minutes"
                    : "Clock in reminder in 10 minutes",
              }}
              onSpeak={speak}
            />
          </div>
          <Link
            to="/admin"
            className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Admin console
          </Link>
        </section>
      </div>
    </main>
  );
}
