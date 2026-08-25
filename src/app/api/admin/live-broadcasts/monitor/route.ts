import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/core/auth/session";
import { getLiveBroadcastsViewModelFromApi } from "@/features/admin/data/services/get-live-broadcasts-view-model";

export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  const cookieHeader = req.headers.get("cookie") ?? "";

  const viewModel = await getLiveBroadcastsViewModelFromApi(
    { fullName: session?.fullName ?? session?.email },
    cookieHeader,
  );

  return NextResponse.json(viewModel, { status: viewModel.phaseState === "error" ? 502 : 200 });
}
