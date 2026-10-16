import { seeOther } from "@/core/lib/see-other";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request, context: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await context.params;
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/ai-jobs?success=retry";

  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/transcription-jobs/${jobId}/retry/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    cache: "no-store",
  });

  // 303 forces the browser to follow up with GET; the default 307 preserves
  // POST, which Next.js's App Router then rejects as an invalid server-action request.
  if (!backendResponse.ok) {
    const failRedirect = seeOther("/ai-jobs?state=error");
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
