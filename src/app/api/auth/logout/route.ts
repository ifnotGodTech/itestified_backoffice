import { NextResponse } from "next/server";
import { backendBaseUrl, extractSetCookieHeaders } from "@/core/auth/backend";

export async function POST(req: Request) {
  const backendResponse = await fetch(`${backendBaseUrl}/auth/admin/logout/`, {
    method: "POST",
    headers: req.headers.get("cookie") ? { cookie: req.headers.get("cookie") ?? "" } : {},
    cache: "no-store",
  });

  const payload = (await backendResponse.json().catch(() => ({}))) as { message?: string };
  const res = NextResponse.json(
    backendResponse.ok ? { ok: true } : { ok: false, message: payload.message ?? "Logout failed." },
    { status: backendResponse.ok ? 200 : backendResponse.status || 500 },
  );
  for (const header of extractSetCookieHeaders(backendResponse)) {
    res.headers.append("set-cookie", header);
  }
  // Best-effort cleanup for legacy frontend-only session cookie.
  res.cookies.set({ name: "itestified_session", value: "", maxAge: 0, path: "/" });
  return res;
}
