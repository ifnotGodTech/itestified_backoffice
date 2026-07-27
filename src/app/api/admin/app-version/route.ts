import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const PLATFORMS = ["android", "ios"] as const;

export async function POST(req: Request) {
  const formData = await req.formData();

  const submitted = PLATFORMS.map((platform) => ({
    platform,
    value: (formData.get(`minimum_version_${platform}`) as string | null)?.trim() ?? "",
  })).filter((entry) => entry.value.length > 0);

  if (submitted.some((entry) => !VERSION_PATTERN.test(entry.value))) {
    return NextResponse.redirect(new URL("/app-version?state=validation", req.url));
  }

  let hadFailure = false;
  const setCookieHeaders: string[] = [];
  for (const entry of submitted) {
    const backendResponse = await fetch(`${backendBaseUrl}/app-versions/admin/requirements/${entry.platform}/`, {
      method: "PUT",
      headers: buildBackendSessionHeaders(req, true),
      body: JSON.stringify({ minimum_version: entry.value }),
      cache: "no-store",
    });
    if (!backendResponse.ok) hadFailure = true;
    setCookieHeaders.push(...extractSetCookieHeaders(backendResponse));
  }

  const redirect = NextResponse.redirect(
    new URL(hadFailure ? "/app-version?state=error" : "/app-version?state=success", req.url),
  );
  for (const header of setCookieHeaders) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
