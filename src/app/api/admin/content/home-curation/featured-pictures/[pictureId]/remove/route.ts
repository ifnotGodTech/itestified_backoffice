import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request, { params }: { params: Promise<{ pictureId: string }> }) {
  const { pictureId } = await params;
  const backendResponse = await fetch(`${backendBaseUrl}/content/admin/home-curation/featured-pictures/${pictureId}/remove/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({}),
    cache: "no-store",
  });
  // status 303 forces the browser to follow up with GET; the default 307 preserves
  // POST, which Next.js's App Router then rejects as an invalid server-action request.
  const redirect = NextResponse.redirect(
    new URL(
      backendResponse.ok
        ? "/home-management?tab=pictures&success=remove"
        : "/home-management?tab=pictures&state=error",
      req.url,
    ),
    303,
  );
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
