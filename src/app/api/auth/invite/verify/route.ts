import { NextResponse } from "next/server";
import { postBackendAuth } from "@/core/auth/backend";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; otp?: string };

  if (!body.email || !body.otp) {
    return NextResponse.json({ message: "Email and invitation code are required." }, { status: 400 });
  }

  const { response, data } = await postBackendAuth("/auth/admin/invite/verify/", {
    email: body.email,
    otp: body.otp,
  });

  return NextResponse.json({ message: data.message ?? "Unable to verify invitation." }, { status: response.status });
}
