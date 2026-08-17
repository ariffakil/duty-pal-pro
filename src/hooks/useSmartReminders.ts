import { useEffect, useRef } from "react";
import { dueReminders, type ReminderContext, type ReminderTone } from "@/lib/reminders";

type Args = Omit<ReminderContext, "now"> & {
  employeeId: string;
  onRemind: (text: string, tone: ReminderTone) => void;
};

/**
 * Smart-watch style reminders: checks the schedule every minute and speaks
 * the due nudges through Nova.
 */
export function useSmartReminders({ employeeId, onRemind, ...ctx }: Args) {
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const remindRef = useRef(onRemind);
  remindRef.current = onRemind;

  useEffect(() => {
    const check = () => {
      const list = dueReminders(employeeId, { ...ctxRef.current, now: new Date() });
      list.forEach((r, i) => setTimeout(() => remindRef.current(r.text, r.tone), i * 4000));
    };
    check();
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
  }, [employeeId]);
}
