import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/referral-payouts?success=mark-paid";

  const backendResponse = await fetch(`${backendBaseUrl}/referrals/admin/commissions/${id}/mark-paid/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req),
    cache: "no-store",
  });

  // status 303 forces the browser to follow up with GET; the default 307 preserves
  // POST, which Next.js's App Router then rejects as an invalid server-action request.
  if (!backendResponse.ok) {
    const failRedirect = NextResponse.redirect(new URL("/referral-payouts?state=error", req.url), 303);
    for (const header of extractSetCookieHeaders(backendResponse)) {
      failRedirect.headers.append("set-cookie", header);
    }
    return failRedirect;
  }

  const redirectResponse = NextResponse.redirect(new URL(next, req.url), 303);
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirectResponse.headers.append("set-cookie", header);
  }
  return redirectResponse;
}
