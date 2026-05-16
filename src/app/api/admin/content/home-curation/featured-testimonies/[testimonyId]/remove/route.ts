import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function GET(req: Request, { params }: { params: Promise<{ testimonyId: string }> }) {
  const { testimonyId } = await params;
  const backendResponse = await fetch(`${backendBaseUrl}/content/admin/home-curation/featured-testimonies/${testimonyId}/remove/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({}),
    cache: "no-store",
  });
  const redirect = NextResponse.redirect(
    new URL(
      backendResponse.ok
        ? "/home-management?success=remove"
        : "/home-management?state=error",
      req.url,
    ),
  );
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}

