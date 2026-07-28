import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";
import { SOCIAL_LINK_PLATFORMS } from "@/features/admin/data/services/get-social-links-view-model";

// A blank string is a valid, intentional URL (turn a platform off without
// deleting the value already entered) -- only a genuinely non-empty,
// malformed string counts as a validation failure. The backend's own
// URLField validation is still the source of truth; this only avoids
// sending obviously-empty submissions for a platform nobody touched.
const URL_PATTERN = /^https?:\/\/.+/i;

export async function POST(req: Request) {
  const formData = await req.formData();

  const submissions = SOCIAL_LINK_PLATFORMS.map((platform, index) => ({
    platform,
    url: (formData.get(`url_${platform}`) as string | null)?.trim() ?? "",
    isActive: formData.get(`is_active_${platform}`) === "on",
    displayOrder: index,
  }));

  const hasInvalidFormat = submissions.some(
    (entry) => entry.url.length > 0 && !URL_PATTERN.test(entry.url),
  );
  // status 303 forces the browser to follow up with GET; the default 307 preserves
  // POST, which Next.js's App Router then rejects as an invalid server-action request.
  if (hasInvalidFormat) {
    return NextResponse.redirect(new URL("/social-links?state=validation", req.url), 303);
  }

  let hadValidationFailure = false;
  let hadOtherFailure = false;
  const setCookieHeaders: string[] = [];
  for (const entry of submissions) {
    const backendResponse = await fetch(`${backendBaseUrl}/social-links/admin/${entry.platform}/`, {
      method: "PUT",
      headers: buildBackendSessionHeaders(req, true),
      body: JSON.stringify({ url: entry.url, is_active: entry.isActive, display_order: entry.displayOrder }),
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
  const redirect = NextResponse.redirect(new URL(`/social-links?state=${targetState}`, req.url), 303);
  for (const header of setCookieHeaders) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
