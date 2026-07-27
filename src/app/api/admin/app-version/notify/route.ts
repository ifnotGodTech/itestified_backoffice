import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

const PLATFORMS = ["android", "ios"] as const;

export async function POST(req: Request) {
  const formData = await req.formData();
  const platform = formData.get("platform");

  // status 303 forces the browser to follow up with GET; the default 307 preserves
  // POST, which Next.js's App Router then rejects as an invalid server-action request.
  if (typeof platform !== "string" || !PLATFORMS.includes(platform as (typeof PLATFORMS)[number])) {
    return NextResponse.redirect(new URL("/app-version?state=error", req.url), 303);
  }

  const backendResponse = await fetch(`${backendBaseUrl}/app-versions/admin/requirements/${platform}/notify/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    cache: "no-store",
  });

  const setCookieHeaders = extractSetCookieHeaders(backendResponse);
  if (!backendResponse.ok) {
    const redirect = NextResponse.redirect(new URL("/app-version?state=error", req.url), 303);
    for (const header of setCookieHeaders) {
      redirect.headers.append("set-cookie", header);
    }
    return redirect;
  }

  const payload = (await backendResponse.json().catch(() => ({}))) as { notified_count?: number };
  const count = typeof payload.notified_count === "number" ? payload.notified_count : 0;
  const redirect = NextResponse.redirect(new URL(`/app-version?state=notified&count=${count}`, req.url), 303);
  for (const header of setCookieHeaders) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
