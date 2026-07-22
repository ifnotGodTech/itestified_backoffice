import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/core/auth/session";
import { getHomeManagementViewModelFromApi } from "@/features/admin/data/services/get-home-management-view-model";

export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  const params = req.nextUrl.searchParams;
  const cookieHeader = req.headers.get("cookie") ?? "";

  const viewModel = await getHomeManagementViewModelFromApi(
    {
      tab: params.get("tab") ?? undefined,
      rule: params.get("rule") ?? undefined,
      count: params.get("count") ?? undefined,
      fullName: session?.fullName ?? session?.email,
    },
    cookieHeader,
  );

  return NextResponse.json(viewModel, { status: viewModel.phaseState === "error" ? 502 : 200 });
}
