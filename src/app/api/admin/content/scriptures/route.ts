import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractBackendErrorMessage, extractSetCookieHeaders } from "@/core/auth/backend";

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

  const destination = new URL(backendResponse.ok ? "/scripture-of-the-day" : "/scripture-of-the-day", req.url);
  if (backendResponse.ok) {
    destination.searchParams.set("saved", "1");
  } else {
    const message = await extractBackendErrorMessage(backendResponse, "Unable to schedule this scripture. Please try again.");
    destination.searchParams.set("edit", "new");
    destination.searchParams.set("error", message);
    destination.searchParams.set("date", payload.date);
    destination.searchParams.set("bibleText", payload.bible_text);
    destination.searchParams.set("scripture", payload.scripture);
    destination.searchParams.set("prayer", payload.prayer);
    destination.searchParams.set("bibleVersion", payload.bible_version);
  }

  // status 303 forces the browser to follow up with GET; the default 307 preserves
  // POST, which Next.js's App Router then rejects as an invalid server-action request.
  const redirect = NextResponse.redirect(destination, 303);
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
