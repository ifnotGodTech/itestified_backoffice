import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request) {
  const formData = await req.formData();
  const payload = {
    date: String(formData.get("date") ?? ""),
    bible_text: String(formData.get("bible_text") ?? ""),
    scripture: String(formData.get("scripture") ?? ""),
    prayer: String(formData.get("prayer") ?? ""),
    bible_version: String(formData.get("bible_version") ?? "KJV"),
    status: "scheduled",
  };

  const backendResponse = await fetch(`${backendBaseUrl}/content/admin/scriptures/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const redirect = NextResponse.redirect(
    new URL(
      backendResponse.ok
        ? "/scripture-of-the-day?saved=1"
        : "/scripture-of-the-day?state=error",
      req.url,
    ),
  );
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
