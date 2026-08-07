import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/core/auth/session";
import { getSubscriptionsViewModelFromApi } from "@/features/admin/data/services/get-subscriptions-view-model";

export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  const params = req.nextUrl.searchParams;
  const cookieHeader = req.headers.get("cookie") ?? "";

  const viewModel = await getSubscriptionsViewModelFromApi(
    {
      tab: params.get("tab") ?? undefined,
      q: params.get("q") ?? undefined,
      fullName: session?.fullName ?? session?.email,
    },
    cookieHeader,
  );

  return NextResponse.json(viewModel, { status: viewModel.phaseState === "error" ? 502 : 200 });
}
