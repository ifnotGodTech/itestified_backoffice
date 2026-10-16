import { seeOther } from "@/core/lib/see-other";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request, context: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await context.params;
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/ai-jobs?success=retry";

  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/translation-jobs/${jobId}/retry/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    cache: "no-store",
  });

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
