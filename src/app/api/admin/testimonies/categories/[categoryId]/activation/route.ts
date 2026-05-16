import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request, context: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await context.params;
  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/categories/${categoryId}/activation/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req),
    cache: "no-store",
  });

  const data = (await backendResponse.json().catch(() => ({}))) as unknown;
  const response = NextResponse.json(data, { status: backendResponse.status });
  for (const header of extractSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", header);
  }
  return response;
}

export async function DELETE(req: Request, context: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await context.params;
  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/categories/${categoryId}/activation/`, {
    method: "DELETE",
    headers: buildBackendSessionHeaders(req),
    cache: "no-store",
  });

  const data = (await backendResponse.json().catch(() => ({}))) as unknown;
  const response = NextResponse.json(data, { status: backendResponse.status });
  for (const header of extractSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", header);
  }
  return response;
}
