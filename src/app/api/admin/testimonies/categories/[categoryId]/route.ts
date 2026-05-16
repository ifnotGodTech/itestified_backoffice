import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function PATCH(req: Request, context: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await context.params;
  const body = (await req.json().catch(() => ({}))) as { name?: string; description?: string };

  const payload: Record<string, string> = {};
  if (typeof body.name === "string") payload.name = body.name.trim();
  if (typeof body.description === "string") payload.description = body.description.trim();

  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/categories/${categoryId}/`, {
    method: "PATCH",
    headers: buildBackendSessionHeaders(req, true),
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
