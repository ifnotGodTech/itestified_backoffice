import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/core/auth/session";
import { getInspirationalPicturesViewModelFromApi } from "@/features/admin/data/services/get-inspirational-pictures-view-model";

export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  const params = req.nextUrl.searchParams;
  const cookieHeader = req.headers.get("cookie") ?? "";

  const viewModel = await getInspirationalPicturesViewModelFromApi(
    {
      status: params.get("status") ?? undefined,
      q: params.get("q") ?? undefined,
      fullName: session?.fullName ?? session?.email,
    },
    cookieHeader,
  );

  return NextResponse.json(viewModel, { status: viewModel.phaseState === "error" ? 502 : 200 });
}
