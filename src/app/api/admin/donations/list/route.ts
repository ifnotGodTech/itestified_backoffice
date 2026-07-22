import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/core/auth/session";
import { getDonationsViewModelFromApi } from "@/features/admin/data/services/get-donations-view-model";

export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  const params = req.nextUrl.searchParams;
  const cookieHeader = req.headers.get("cookie") ?? "";

  const viewModel = await getDonationsViewModelFromApi(
    {
      tab: params.get("tab") ?? undefined,
      month: params.get("month") ?? undefined,
      q: params.get("q") ?? undefined,
      minAmount: params.get("minAmount") ?? undefined,
      maxAmount: params.get("maxAmount") ?? undefined,
      currency: params.get("currency") ?? undefined,
      from: params.get("from") ?? undefined,
      to: params.get("to") ?? undefined,
      statusFilter: params.get("statusFilter") ?? undefined,
      fullName: session?.fullName ?? session?.email,
    },
    cookieHeader,
  );

  return NextResponse.json(viewModel, { status: viewModel.phaseState === "error" ? 502 : 200 });
}
