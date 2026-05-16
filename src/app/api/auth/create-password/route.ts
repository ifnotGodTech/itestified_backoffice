import { NextResponse } from "next/server";

export async function POST(req: Request) {
  void req;
  return NextResponse.json(
    {
      message:
        "Shared entry-code setup has been retired. Ask a super admin for an invitation or run bootstrap_super_admin out-of-band.",
    },
    { status: 410 },
  );
}
