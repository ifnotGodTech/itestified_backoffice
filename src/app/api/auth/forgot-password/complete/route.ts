import { NextResponse } from "next/server";
import { postBackendAuth } from "@/core/auth/backend";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string };

  if (!body.email || !body.password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  const { response, data } = await postBackendAuth("/auth/admin/password-reset/complete/", {
    email: body.email,
    password: body.password,
  });

  return NextResponse.json(
    { message: data.message ?? "Unable to complete password reset." },
    { status: response.status },
  );
}
