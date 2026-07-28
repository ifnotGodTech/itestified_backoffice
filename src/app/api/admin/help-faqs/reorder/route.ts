import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { ordered_ids?: number[] };

  const backendResponse = await fetch(`${backendBaseUrl}/profile-content/admin/faqs/reorder/`, {
    method: "PUT",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({ ordered_ids: body.ordered_ids ?? [] }),
    cache: "no-store",
  });

  const data = (await backendResponse.json().catch(() => ({}))) as unknown;
  const response = NextResponse.json(data, { status: backendResponse.status });
  for (const header of extractSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", header);
  }
  return response;
}
