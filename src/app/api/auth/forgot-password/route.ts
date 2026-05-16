import { NextResponse } from "next/server";
import { postBackendAuth } from "@/core/auth/backend";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string };

  if (!body.email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  const { response, data } = await postBackendAuth("/auth/admin/forgot-password/", {
    email: body.email,
  });

  return NextResponse.json(
    { message: data.message ?? "If the email exists, a reset code has been sent." },
    { status: response.status },
  );
}
