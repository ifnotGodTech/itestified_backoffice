import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request) {
  const formData = await req.formData();
  const payload = {
    allow_email_notifications: formData.has("allow_email_notifications"),
    notify_new_donation_received: formData.has("notify_new_donation_received"),
    send_donation_thank_you_email: formData.has("send_donation_thank_you_email"),
  };

  if (!payload.allow_email_notifications && !payload.notify_new_donation_received && !payload.send_donation_thank_you_email) {
    return NextResponse.redirect(new URL("/notification-settings?state=validation", req.url));
  }

  const backendResponse = await fetch(`${backendBaseUrl}/notifications/preferences/me/`, {
    method: "PATCH",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const redirect = NextResponse.redirect(
    new URL(backendResponse.ok ? "/notification-settings?success=1" : "/notification-settings?state=error", req.url),
  );
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
