import { NextResponse } from "next/server";
import {
  backendBaseUrl,
  buildBackendSessionHeaders,
  extractSetCookieHeaders,
} from "@/core/auth/backend";

async function proxyPolicy(req: Request, method: "GET" | "PATCH") {
  const body = method === "PATCH" ? await req.text() : undefined;
  const backendResponse = await fetch(`${backendBaseUrl}/testimonies/admin/audio-upload-policy/`, {
    method,
    headers: buildBackendSessionHeaders(req, method === "PATCH"),
    body,
    cache: "no-store",
  });
  const data = (await backendResponse.json().catch(() => ({}))) as unknown;
  const response = NextResponse.json(data, { status: backendResponse.status });
  for (const header of extractSetCookieHeaders(backendResponse)) response.headers.append("set-cookie", header);
  return response;
}

export async function GET(req: Request) {
  return proxyPolicy(req, "GET");
}

export async function PATCH(req: Request) {
  return proxyPolicy(req, "PATCH");
}
