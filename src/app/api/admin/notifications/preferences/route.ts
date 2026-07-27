import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request) {
  const formData = await req.formData();
  const payload = {
    allow_email_notifications: formData.has("allow_email_notifications"),
    allow_push_notifications: formData.has("allow_push_notifications"),
    notify_new_donation_received: formData.has("notify_new_donation_received"),
    send_donation_thank_you_email: formData.has("send_donation_thank_you_email"),
  };

  // status 303 forces the browser to follow up with GET; the default 307 preserves
  // POST, which Next.js's App Router then rejects as an invalid server-action request.
  if (!Object.values(payload).some(Boolean)) {
    return NextResponse.redirect(new URL("/notification-settings?state=validation", req.url), 303);
  }

  const backendResponse = await fetch(`${backendBaseUrl}/notifications/preferences/me/`, {
    method: "PATCH",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const redirect = NextResponse.redirect(
    new URL(backendResponse.ok ? "/notification-settings?success=1" : "/notification-settings?state=error", req.url),
    303,
  );
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
