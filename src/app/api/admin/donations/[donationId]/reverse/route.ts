import { seeOther } from "@/core/lib/see-other";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request, context: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await context.params;
  const url = new URL(req.url);
  const reason = url.searchParams.get("reason")?.trim() || "Reversal requested by admin review.";
  const next = url.searchParams.get("next") || "/donations?success=reverse";

  const backendResponse = await fetch(`${backendBaseUrl}/donations/admin/donations/${donationId}/reverse/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({ reason }),
    cache: "no-store",
  });

  // status 303 forces the browser to follow up with GET; the default 307 preserves
  // POST, which Next.js's App Router then rejects as an invalid server-action request.
  if (!backendResponse.ok) {
    const failRedirect = seeOther("/donations?state=error");
    for (const header of extractSetCookieHeaders(backendResponse)) {
      failRedirect.headers.append("set-cookie", header);
    }
    return failRedirect;
  }

  const redirectResponse = seeOther(next);
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirectResponse.headers.append("set-cookie", header);
  }
  return redirectResponse;
}
