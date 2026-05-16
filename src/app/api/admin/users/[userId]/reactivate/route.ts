import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function GET(req: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  const next = new URL(req.url).searchParams.get("next") || "/users?tab=registered&success=reactivate";
  const backendResponse = await fetch(`${backendBaseUrl}/users/admin/users/${userId}/reactivate/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({}),
    cache: "no-store",
  });

  const redirect = NextResponse.redirect(
    new URL(
      backendResponse.ok
        ? next
        : "/users?state=error",
      req.url,
    ),
  );
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
