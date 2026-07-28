import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await req.json().catch(() => ({}))) as {
    question?: string;
    answer?: string;
    is_active?: boolean;
  };

  const payload: Record<string, string | boolean> = {};
  if (typeof body.question === "string") payload.question = body.question.trim();
  if (typeof body.answer === "string") payload.answer = body.answer.trim();
  if (typeof body.is_active === "boolean") payload.is_active = body.is_active;

  const backendResponse = await fetch(`${backendBaseUrl}/profile-content/admin/faqs/${id}/`, {
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

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const backendResponse = await fetch(`${backendBaseUrl}/profile-content/admin/faqs/${id}/`, {
    method: "DELETE",
    headers: buildBackendSessionHeaders(req),
    cache: "no-store",
  });

  const response = new NextResponse(null, { status: backendResponse.status });
  for (const header of extractSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", header);
  }
  return response;
}
