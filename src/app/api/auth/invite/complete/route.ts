import { NextResponse } from "next/server";
import { extractSetCookieHeaders, postBackendAuth } from "@/core/auth/backend";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string };

  if (!body.email || !body.password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  const { response, data } = await postBackendAuth("/auth/admin/invite/complete/", {
    email: body.email,
    password: body.password,
  });

  if (!response.ok || data.role !== "admin" || typeof data.email !== "string") {
    return NextResponse.json({ message: data.message ?? "Unable to complete invitation." }, { status: response.status });
  }

  const res = NextResponse.json({ role: "admin", email: data.email });
  for (const header of extractSetCookieHeaders(response)) {
    res.headers.append("set-cookie", header);
  }

  return res;
}
