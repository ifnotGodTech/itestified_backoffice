import { seeOther } from "@/core/lib/see-other";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/creators-ministries?success=unverify";

  const backendResponse = await fetch(`${backendBaseUrl}/creators/admin/${userId}/verify/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({ is_verified: false }),
    cache: "no-store",
  });

  if (!backendResponse.ok) {
    const failRedirect = seeOther("/creators-ministries?state=error");
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
