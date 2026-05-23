import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function PATCH(req: Request, context: { params: Promise<{ testimonyId: string }> }) {
  const { testimonyId } = await context.params;
  const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/testimonies/${testimonyId}/edit/`, {
    method: "PATCH",
    headers: {
      ...buildBackendSessionHeaders(req),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = (await backendResponse.json().catch(() => ({}))) as unknown;
  const response = NextResponse.json(data, { status: backendResponse.status });
  for (const header of extractSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", header);
  }
  return response;
}
