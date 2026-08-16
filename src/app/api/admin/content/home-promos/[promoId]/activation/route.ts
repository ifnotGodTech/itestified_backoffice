import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

async function proxy(req: Request, promoId: string, method: "POST" | "DELETE") {
  const backendResponse = await fetch(`${backendBaseUrl}/content/admin/home-promos/${promoId}/activation/`, {
    method,
    headers: buildBackendSessionHeaders(req),
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

export async function POST(req: Request, context: { params: Promise<{ promoId: string }> }) {
  const { promoId } = await context.params;
  return proxy(req, promoId, "POST");
}

export async function DELETE(req: Request, context: { params: Promise<{ promoId: string }> }) {
  const { promoId } = await context.params;
  return proxy(req, promoId, "DELETE");
}
