import { NextResponse } from "next/server";
import { extractSetCookieHeaders, postBackendAuth } from "@/core/auth/backend";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string };

  if (!body.email || !body.password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  const { response, data } = await postBackendAuth("/auth/admin/login/", {
    email: body.email,
    password: body.password,
  });

  if (!response.ok || data.role !== "admin" || typeof data.email !== "string") {
    return NextResponse.json({ message: data.message ?? "Invalid email or password." }, { status: response.status });
  }

  const res = NextResponse.json({
    role: "admin",
    email: data.email,
    must_change_password: data.must_change_password === true,
  });
  for (const header of extractSetCookieHeaders(response)) {
    res.headers.append("set-cookie", header);
  }

  return res;
}
