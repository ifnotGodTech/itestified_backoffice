import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const PLATFORMS = ["android", "ios"] as const;

export async function POST(req: Request) {
  const formData = await req.formData();

  const submissions = PLATFORMS.map((platform) => ({
    platform,
    minimumVersion: (formData.get(`minimum_version_${platform}`) as string | null)?.trim() ?? "",
    latestVersion: (formData.get(`latest_version_${platform}`) as string | null)?.trim() ?? "",
  })).filter((entry) => entry.minimumVersion.length > 0 || entry.latestVersion.length > 0);

  const hasInvalidFormat = submissions.some(
    (entry) =>
      (entry.minimumVersion.length > 0 && !VERSION_PATTERN.test(entry.minimumVersion)) ||
      (entry.latestVersion.length > 0 && !VERSION_PATTERN.test(entry.latestVersion)),
  );
  if (hasInvalidFormat) {
    return NextResponse.redirect(new URL("/app-version?state=validation", req.url));
  }

  let hadFailure = false;
  const setCookieHeaders: string[] = [];
  for (const entry of submissions) {
    const body: Record<string, string> = { latest_version: entry.latestVersion };
    if (entry.minimumVersion) body.minimum_version = entry.minimumVersion;

    const backendResponse = await fetch(`${backendBaseUrl}/app-versions/admin/requirements/${entry.platform}/`, {
      method: "PUT",
      headers: buildBackendSessionHeaders(req, true),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!backendResponse.ok) hadFailure = true;
    setCookieHeaders.push(...extractSetCookieHeaders(backendResponse));
  }

  const redirect = NextResponse.redirect(
    new URL(hadFailure ? "/app-version?state=validation" : "/app-version?state=success", req.url),
  );
  for (const header of setCookieHeaders) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
