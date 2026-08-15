import { createServerFn } from "@tanstack/react-start";

export type StaffRequestKind = "late" | "leave";

export const submitStaffRequest = createServerFn({ method: "POST" })
  .inputValidator((input: {
    kind: StaffRequestKind;
    employeeId: string;
    employeeName: string;
    reason: string;
    lateMinutes?: number;
    at: string;
  }) => input)
  .handler(async ({ data }) => {
    const hrEmail = process.env["HR_MANAGER_EMAIL"] ?? "hr@example.com";

    // Record on the server (visible in server logs / future HR dashboard).
    console.info("[staff-request]", JSON.stringify({ ...data, hrEmail }));

    return {
      ok: true,
      reference: `${data.kind.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      notified: hrEmail,
    };
  });
