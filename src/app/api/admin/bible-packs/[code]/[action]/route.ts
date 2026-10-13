import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

// Phase 34 Slice 8: the Bible settings page's three actions, proxied to the
// backend with the admin's session, then back to the page with the outcome.
const ACTIONS = new Set(["enable", "disable", "make-default"]);

// A relative Location: the browser resolves it against the address it's
// actually on. Building an absolute URL from req.url sends it to
// "localhost" in dev even when the admin opened 127.0.0.1, and the session
// cookie (scoped to the host) doesn't follow.
function backToPage(query: URLSearchParams): NextResponse {
  return new NextResponse(null, { status: 303, headers: { location: `/bible-packs?${query.toString()}` } });
}

export async function POST(req: Request, { params }: { params: Promise<{ code: string; action: string }> }) {
  const { code, action } = await params;
  const query = new URLSearchParams();
  if (!ACTIONS.has(action) || !/^[a-z0-9-]{1,32}$/.test(code)) {
    query.set("state", "error");
    return backToPage(query);
  }

  const backendResponse = await fetch(`${backendBaseUrl}/bible/admin/packs/${code}/${action}/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    cache: "no-store",
  });

  query.set("pack", code);
  if (backendResponse.ok) {
    query.set("state", "success");
    query.set("action", action);
  } else if (backendResponse.status === 400) {
    // The backend explains a refused change ("…is the only Bible readers
    // can download"); pass its words through.
    const body = (await backendResponse.json().catch(() => ({}))) as { message?: string };
    query.set("state", "refused");
    if (body.message) query.set("message", body.message);
  } else {
    query.set("state", "error");
  }
  const redirect = backToPage(query);
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
