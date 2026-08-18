import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Users,
  DoorOpen,
  CalendarClock,
  ScanFace,
  ClipboardList,
  Search,
  ShieldCheck,
  ArrowLeft,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

import { NovaFloating } from "@/components/att/NovaFloating";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Nova Attend" },
      {
        name: "description",
        content:
          "Manage employees, access areas, shift schedules and review face verifications and attendance logs.",
      },
      { property: "og:title", content: "Admin Console — Nova Attend" },
      {
        property: "og:description",
        content:
          "Nova Attend admin console for employees, access zones, shifts and attendance audit logs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

type TabKey = "employees" | "areas" | "shifts" | "verifications" | "logs";

const TABS: { key: TabKey; label: string; icon: typeof Users }[] = [
  { key: "employees", label: "Employees", icon: Users },
  { key: "areas", label: "Access areas", icon: DoorOpen },
  { key: "shifts", label: "Shift schedules", icon: CalendarClock },
  { key: "verifications", label: "Face verifications", icon: ScanFace },
  { key: "logs", label: "Attendance logs", icon: ClipboardList },
];

const employees = [
  { id: "EMP-2481", name: "Ariff Mohamed", role: "Site Engineer", site: "Karama, Dubai", shift: "Day 10:00–19:00", status: "Active", face: "Enrolled" },
  { id: "EMP-2490", name: "Salma Haddad", role: "HR Executive", site: "Head Office", shift: "Day 09:00–18:00", status: "Active", face: "Enrolled" },
  { id: "EMP-2502", name: "Rajesh Nair", role: "Security Lead", site: "Gate 2", shift: "Night 20:00–05:00", status: "Active", face: "Re-enroll" },
  { id: "EMP-2515", name: "Mei Lin", role: "QA Inspector", site: "Warehouse B", shift: "Split 08:00–17:00", status: "On leave", face: "Enrolled" },
  { id: "EMP-2533", name: "Omar Farouk", role: "Technician", site: "Karama, Dubai", shift: "Day 10:00–19:00", status: "Suspended", face: "Not enrolled" },
];

const areas = [
  { name: "Gate 2 — Main entrance", reader: "Face + Card", groups: "All staff", hours: "24/7", level: "Standard" },
  { name: "Server room", reader: "Face + PIN", groups: "IT, Security Lead", hours: "08:00–20:00", level: "Restricted" },
  { name: "Warehouse B", reader: "Face", groups: "Logistics, QA", hours: "06:00–22:00", level: "Standard" },
  { name: "Executive floor", reader: "Face + Card", groups: "Management", hours: "07:00–21:00", level: "Restricted" },
  { name: "Rooftop plant", reader: "Face + Escort", groups: "Maintenance", hours: "By permit", level: "High risk" },
];

const shifts = [
  { name: "Day shift", window: "10:00 – 19:00", grace: "10 min", days: "Sun – Thu", assigned: 128, breaks: "1× 60 min" },
  { name: "Early shift", window: "08:00 – 17:00", grace: "5 min", days: "Sun – Thu", assigned: 64, breaks: "1× 45 min" },
  { name: "Night shift", window: "20:00 – 05:00", grace: "15 min", days: "Daily", assigned: 41, breaks: "2× 30 min" },
  { name: "Weekend cover", window: "09:00 – 15:00", grace: "10 min", days: "Fri – Sat", assigned: 18, breaks: "1× 30 min" },
];

const verifications = [
  { time: "10:30:12", name: "Ariff Mohamed", area: "Gate 2", score: 0.98, result: "Match", liveness: "Pass" },
  { time: "10:28:44", name: "Salma Haddad", area: "Head Office", score: 0.96, result: "Match", liveness: "Pass" },
  { time: "10:21:03", name: "Unknown", area: "Server room", score: 0.41, result: "Rejected", liveness: "Fail" },
  { time: "09:58:31", name: "Mei Lin", area: "Warehouse B", score: 0.93, result: "Match", liveness: "Pass" },
  { time: "09:47:12", name: "Rajesh Nair", area: "Gate 2", score: 0.71, result: "Review", liveness: "Pass" },
];

const logs = [
  { date: "15 Aug", name: "Ariff Mohamed", in: "10:30", out: "19:04", hours: "8h 34m", status: "Late 30m" },
  { date: "15 Aug", name: "Salma Haddad", in: "08:56", out: "18:02", hours: "9h 06m", status: "On time" },
  { date: "15 Aug", name: "Rajesh Nair", in: "20:05", out: "—", hours: "In progress", status: "On time" },
  { date: "14 Aug", name: "Mei Lin", in: "—", out: "—", hours: "—", status: "Absent" },
  { date: "14 Aug", name: "Omar Farouk", in: "10:12", out: "16:40", hours: "6h 28m", status: "Early out" },
];

const stats = [
  { label: "Employees", value: "251", sub: "+6 this month" },
  { label: "Present today", value: "218", sub: "86.9% attendance" },
  { label: "Face matches", value: "1,942", sub: "last 24 hours" },
  { label: "Access denials", value: "7", sub: "3 need review" },
];

function Pill({ text }: { text: string }) {
  const tone =
    /Active|Match|Pass|On time|Enrolled/.test(text)
      ? "bg-success/15 text-success"
      : /Late|Review|Re-enroll|Early|On leave|Restricted/.test(text)
        ? "bg-warning/15 text-warning"
        : /Rejected|Fail|Absent|Suspended|Not enrolled|High risk/.test(text)
          ? "bg-destructive/15 text-destructive"
          : "bg-secondary text-muted-foreground";
  const Icon = /Rejected|Fail|Absent|Suspended|Not enrolled|High risk/.test(text)
    ? XCircle
    : /Late|Review|Re-enroll|Early|On leave|Restricted/.test(text)
      ? AlertTriangle
      : CheckCircle2;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="surface-card overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {head.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0 hover:bg-secondary/40">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-3 align-middle">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminPage() {
  const [tab, setTab] = useState<TabKey>("employees");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const match = (...values: string[]) =>
    !q || values.some((v) => v.toLowerCase().includes(q));

  const content = useMemo(() => {
    switch (tab) {
      case "employees":
        return (
          <Table
            head={["Employee", "ID", "Role", "Site", "Shift", "Face", "Status"]}
            rows={employees
              .filter((e) => match(e.name, e.id, e.role, e.site))
              .map((e) => [
                <span className="font-medium">{e.name}</span>,
                <span className="font-mono text-xs text-muted-foreground">{e.id}</span>,
                e.role,
                e.site,
                e.shift,
                <Pill text={e.face} />,
                <Pill text={e.status} />,
              ])}
          />
        );
      case "areas":
        return (
          <Table
            head={["Area", "Reader", "Allowed groups", "Hours", "Clearance"]}
            rows={areas
              .filter((a) => match(a.name, a.groups))
              .map((a) => [
                <span className="font-medium">{a.name}</span>,
                a.reader,
                a.groups,
                a.hours,
                <Pill text={a.level} />,
              ])}
          />
        );
      case "shifts":
        return (
          <Table
            head={["Shift", "Window", "Grace", "Days", "Breaks", "Assigned"]}
            rows={shifts
              .filter((s) => match(s.name, s.window, s.days))
              .map((s) => [
                <span className="font-medium">{s.name}</span>,
                <span className="font-mono tabular-nums">{s.window}</span>,
                s.grace,
                s.days,
                s.breaks,
                <span className="font-semibold">{s.assigned}</span>,
              ])}
          />
        );
      case "verifications":
        return (
          <Table
            head={["Time", "Person", "Area", "Match score", "Liveness", "Result"]}
            rows={verifications
              .filter((v) => match(v.name, v.area, v.result))
              .map((v) => [
                <span className="font-mono tabular-nums text-muted-foreground">{v.time}</span>,
                <span className="font-medium">{v.name}</span>,
                v.area,
                <span className="font-mono tabular-nums">{v.score.toFixed(2)}</span>,
                <Pill text={v.liveness} />,
                <Pill text={v.result} />,
              ])}
          />
        );
      case "logs":
      default:
        return (
          <Table
            head={["Date", "Employee", "Clock in", "Clock out", "Worked", "Status"]}
            rows={logs
              .filter((l) => match(l.name, l.status, l.date))
              .map((l) => [
                l.date,
                <span className="font-medium">{l.name}</span>,
                <span className="font-mono tabular-nums">{l.in}</span>,
                <span className="font-mono tabular-nums">{l.out}</span>,
                l.hours,
                <Pill text={l.status} />,
              ])}
          />
        );
    }
  }, [tab, q]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[320px] halo" />

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to employee app
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Admin <span className="gradient-text">console</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Manage employees, allowed access areas and shift schedules — and audit every face
              verification and attendance entry.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" /> Signed in as Admin · Nova Attend
          </span>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="surface-card p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums">{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                tab === key
                  ? "border-primary/40 bg-primary/15 text-foreground"
                  : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search records…"
              className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />
          </label>
          <button className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90" style={{ backgroundImage: "var(--gradient-aurora)" }}>
            <Plus className="h-4 w-4" />
            New {tab === "employees" ? "employee" : tab === "areas" ? "area" : tab === "shifts" ? "shift" : "export"}
          </button>
        </div>

        <div className="mt-4 pb-12">{content}</div>
      </div>
      <NovaFloating />
    </main>
  );
}
