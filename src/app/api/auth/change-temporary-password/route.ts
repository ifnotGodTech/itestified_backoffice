import { NextResponse } from "next/server";
import { backendBaseUrl, extractSetCookieHeaders } from "@/core/auth/backend";

function extractErrorMessage(data: Record<string, unknown>): string {
  const topLevel = typeof data.message === "string" ? data.message : null;
  if (topLevel) return topLevel;

  const error = typeof data.error === "object" && data.error ? (data.error as Record<string, unknown>) : null;
  const nested = error && typeof error.message === "string" ? error.message : null;
  if (nested) return nested;

  const detail = typeof data.detail === "string" ? data.detail : null;
  if (detail) return detail;

  return "Unable to change password.";
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  };

  if (!body.currentPassword || !body.newPassword || !body.confirmNewPassword) {
    return NextResponse.json({ message: "All password fields are required." }, { status: 400 });
  }

  const backendResponse = await fetch(`${backendBaseUrl}/auth/admin/change-temporary-password/`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(req.headers.get("cookie") ? { cookie: req.headers.get("cookie") ?? "" } : {}),
    },
    body: JSON.stringify({
      current_password: body.currentPassword,
      new_password: body.newPassword,
      confirm_new_password: body.confirmNewPassword,
    }),
    cache: "no-store",
  });

  const data = (await backendResponse.json().catch(() => ({}))) as Record<string, unknown>;
  const payload = backendResponse.ok
    ? data
    : {
        ...data,
        message: extractErrorMessage(data),
      };
  const response = NextResponse.json(payload, { status: backendResponse.status });
  for (const header of extractSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", header);
  }
  return response;
}
