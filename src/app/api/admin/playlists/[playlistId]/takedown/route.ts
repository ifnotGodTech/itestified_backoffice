import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request, context: { params: Promise<{ playlistId: string }> }) {
  const { playlistId } = await context.params;
  const body = (await req.json().catch(() => ({}))) as { action?: string; reason?: string };

  const backendResponse = await fetch(`${backendBaseUrl}/playlists/admin/playlists/${playlistId}/takedown/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({ action: body.action ?? "", reason: body.reason ?? "" }),
    cache: "no-store",
  });

  // Django's "delete" action returns 204 No Content -- a Response with that
  // status must not carry a body, so NextResponse.json() (which always
  // writes one) throws. Only build a JSON response when there is a body.
  if (backendResponse.status === 204) {
    const response = new NextResponse(null, { status: 204 });
    for (const header of extractSetCookieHeaders(backendResponse)) {
      response.headers.append("set-cookie", header);
    }
    return response;
  }

  const data = (await backendResponse.json().catch(() => ({}))) as unknown;
  const response = NextResponse.json(data ?? {}, { status: backendResponse.status });
  for (const header of extractSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", header);
  }
  return response;
}
