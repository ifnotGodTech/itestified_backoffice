import { NextResponse } from "next/server";
import { postBackendAuth } from "@/core/auth/backend";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; otp?: string };

  if (!body.email || !body.otp) {
    return NextResponse.json({ message: "Email and reset code are required." }, { status: 400 });
  }

  const { response, data } = await postBackendAuth("/auth/admin/password-reset/verify/", {
    email: body.email,
    otp: body.otp,
  });

  return NextResponse.json({ message: data.message ?? "Unable to verify reset code." }, { status: response.status });
}
