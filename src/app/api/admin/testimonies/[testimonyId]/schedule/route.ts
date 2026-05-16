import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request, context: { params: Promise<{ testimonyId: string }> }) {
  const { testimonyId } = await context.params;
  const body = (await req.json().catch(() => ({}))) as { publish_at?: string };

  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/testimonies/${testimonyId}/schedule/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({ publish_at: body.publish_at ?? "" }),
    cache: "no-store",
  });

  const data = (await backendResponse.json().catch(() => ({}))) as unknown;
  const response = NextResponse.json(data, { status: backendResponse.status });
  for (const header of extractSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", header);
  }
  return response;
}
