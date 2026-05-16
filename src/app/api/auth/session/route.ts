import { NextResponse } from "next/server";
import { backendBaseUrl } from "@/core/auth/backend";

export async function GET(req: Request) {
  const response = await fetch(`${backendBaseUrl}/auth/admin/session/`, {
    method: "GET",
    headers: req.headers.get("cookie") ? { cookie: req.headers.get("cookie") ?? "" } : {},
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return NextResponse.json({
    authenticated: true,
    email: payload.email,
    role: payload.role,
    role_code: payload.role_code,
    full_name: payload.full_name,
    must_change_password: payload.must_change_password === true,
  });
}
