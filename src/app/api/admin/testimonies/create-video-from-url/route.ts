import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request) {
  const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/testimonies/create-video-from-url/`, {
    method: "POST",
    headers: {
      ...buildBackendSessionHeaders(req),
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const backendContentType = (backendResponse.headers.get("content-type") || "").toLowerCase();
  const data = backendContentType.includes("application/json")
    ? ((await backendResponse.json().catch(() => ({}))) as unknown)
    : ({ message: (await backendResponse.text().catch(() => "")).trim() || "Request failed." } as unknown);

  const response = NextResponse.json(data, { status: backendResponse.status });
  for (const header of extractSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", header);
  }
  return response;
}
