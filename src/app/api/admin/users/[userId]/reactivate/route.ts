import { seeOther } from "@/core/lib/see-other";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  const next = new URL(req.url).searchParams.get("next") || "/users?tab=registered&success=reactivate";
  const backendResponse = await fetch(`${backendBaseUrl}/users/admin/users/${userId}/reactivate/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({}),
    cache: "no-store",
  });

  // status 303 forces the browser to follow up with GET; the default 307 preserves
  // POST, which Next.js's App Router then rejects as an invalid server-action request.
  const redirect = seeOther(backendResponse.ok ? next : "/users?state=error");
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
