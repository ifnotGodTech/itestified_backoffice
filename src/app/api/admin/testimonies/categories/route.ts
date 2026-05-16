import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

export async function GET(req: Request) {
  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/categories/`, {
    method: "GET",
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

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; description?: string };
  if (!body.name?.trim()) {
    return NextResponse.json({ message: "Category name is required." }, { status: 400 });
  }

  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/categories/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({ name: body.name.trim(), description: (body.description ?? "").trim() }),
    cache: "no-store",
  });

  const data = (await backendResponse.json().catch(() => ({}))) as unknown;
  const response = NextResponse.json(data, { status: backendResponse.status });
  for (const header of extractSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", header);
  }
  return response;
}
