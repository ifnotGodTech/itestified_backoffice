import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function DELETE(req: Request, { params }: { params: Promise<{ testimonyId: string }> }) {
  const { testimonyId } = await params;
  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/testimonies/${testimonyId}/delete/`, {
    method: "DELETE",
    headers: buildBackendSessionHeaders(req),
    cache: "no-store",
  });

  const backendContentType = (backendResponse.headers.get("content-type") || "").toLowerCase();
  const data = backendContentType.includes("application/json")
    ? ((await backendResponse.json().catch(() => ({}))) as unknown)
    : ({ message: (await backendResponse.text().catch(() => "")).trim() || "Delete request failed." } as unknown);

  const response = NextResponse.json(data, { status: backendResponse.status });
  for (const header of extractSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", header);
  }
  return response;
}
