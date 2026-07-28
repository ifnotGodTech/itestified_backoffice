import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";
import { PROFILE_CONTENT_KEYS } from "@/features/admin/data/services/get-profile-content-view-model";

export async function POST(req: Request) {
  const formData = await req.formData();

  const submissions = PROFILE_CONTENT_KEYS.map((key) => ({
    key,
    body: (formData.get(`body_${key}`) as string | null) ?? "",
  }));

  let hadValidationFailure = false;
  let hadOtherFailure = false;
  const setCookieHeaders: string[] = [];
  for (const entry of submissions) {
    const backendResponse = await fetch(`${backendBaseUrl}/profile-content/admin/blocks/${entry.key}/`, {
      method: "PUT",
      headers: buildBackendSessionHeaders(req, true),
      body: JSON.stringify({ body: entry.body }),
      cache: "no-store",
    });
    if (backendResponse.status === 400) {
      hadValidationFailure = true;
    } else if (!backendResponse.ok) {
      hadOtherFailure = true;
    }
    setCookieHeaders.push(...extractSetCookieHeaders(backendResponse));
  }

  const targetState = hadValidationFailure ? "validation" : hadOtherFailure ? "error" : "success";
  // status 303 forces the browser to follow up with GET; the default 307 preserves
  // POST, which Next.js's App Router then rejects as an invalid server-action request.
  const redirect = NextResponse.redirect(new URL(`/profile-content?state=${targetState}`, req.url), 303);
  for (const header of setCookieHeaders) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
