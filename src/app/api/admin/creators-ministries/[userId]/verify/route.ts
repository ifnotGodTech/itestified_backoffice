import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/creators-ministries?success=verify";

  const backendResponse = await fetch(`${backendBaseUrl}/creators/admin/${userId}/verify/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({ is_verified: true }),
    cache: "no-store",
  });

  // status 303 forces the browser to follow up with GET; the default 307 preserves
  // POST, which Next.js's App Router then rejects as an invalid server-action request.
  if (!backendResponse.ok) {
    const failRedirect = NextResponse.redirect(new URL("/creators-ministries?state=error", req.url), 303);
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
