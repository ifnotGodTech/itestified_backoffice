import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request) {
  const formData = await req.formData();
  const maxConcurrentViewers = Number.parseInt(String(formData.get("max_concurrent_viewers") ?? ""), 10);
  const maxDurationMinutes = Number.parseInt(String(formData.get("max_duration_minutes") ?? ""), 10);
  const sharedMonthlyCeilingMinutes = Number.parseInt(String(formData.get("shared_monthly_ceiling_minutes") ?? ""), 10);
  const defaultMinistryMonthlyAllowanceMinutes = Number.parseInt(
    String(formData.get("default_ministry_monthly_allowance_minutes") ?? ""),
    10,
  );
  const isEnabled = formData.get("is_enabled") != null;

  const allValid = [maxConcurrentViewers, maxDurationMinutes, sharedMonthlyCeilingMinutes, defaultMinistryMonthlyAllowanceMinutes].every(
    (value) => Number.isFinite(value) && value > 0,
  );
  if (!allValid) {
    return NextResponse.redirect(new URL("/live-broadcasts/policy?section=policy&state=validation", req.url), 303);
  }

  const backendResponse = await fetch(`${backendBaseUrl}/live-broadcasts/admin/policy/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({
      is_enabled: isEnabled,
      max_concurrent_viewers: maxConcurrentViewers,
      max_duration_minutes: maxDurationMinutes,
      shared_monthly_ceiling_minutes: sharedMonthlyCeilingMinutes,
      default_ministry_monthly_allowance_minutes: defaultMinistryMonthlyAllowanceMinutes,
    }),
    cache: "no-store",
  });

  const targetState = backendResponse.status === 400 ? "validation" : backendResponse.ok ? "success" : "error";
  const redirect = NextResponse.redirect(
    new URL(`/live-broadcasts/policy?section=policy&state=${targetState}`, req.url),
    303,
  );
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
