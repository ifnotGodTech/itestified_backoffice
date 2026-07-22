import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/core/auth/session";
import { getScriptureOfTheDayViewModelFromApi } from "@/features/admin/data/services/get-scripture-of-the-day-view-model";

export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  const params = req.nextUrl.searchParams;
  const cookieHeader = req.headers.get("cookie") ?? "";

  const viewModel = await getScriptureOfTheDayViewModelFromApi(
    {
      fullName: session?.fullName ?? session?.email,
      tab: params.get("tab") ?? undefined,
      q: params.get("q") ?? undefined,
      count: params.get("count") ?? undefined,
      from: params.get("from") ?? undefined,
      to: params.get("to") ?? undefined,
      status: params.get("status") ?? undefined,
    },
    cookieHeader,
  );

  return NextResponse.json(viewModel);
}
