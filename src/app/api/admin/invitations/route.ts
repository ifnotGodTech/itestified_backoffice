import { NextResponse } from "next/server";
import { backendBaseUrl, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; roleCode?: string };

  if (!body.email || !body.roleCode) {
    return NextResponse.json({ message: "Email and role code are required." }, { status: 400 });
  }

  const backendResponse = await fetch(`${backendBaseUrl}/auth/admin/invitations/`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(req.headers.get("cookie") ? { cookie: req.headers.get("cookie") ?? "" } : {}),
    },
    body: JSON.stringify({ email: body.email, role_code: body.roleCode }),
    cache: "no-store",
  });

  const data = (await backendResponse.json().catch(() => ({}))) as Record<string, unknown>;
  const response = NextResponse.json(data, { status: backendResponse.status });
  for (const header of extractSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", header);
  }
  return response;
}
