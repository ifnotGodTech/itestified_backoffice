import { NextResponse } from "next/server";
import { backendBaseUrl } from "@/core/auth/backend";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const response = await fetch(`${backendBaseUrl}/notifications/admin/history/?status=unread&type=testimony_submitted&page_size=1`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    const payload = (await response.json().catch(() => ({}))) as {
      count?: number;
    };
    return NextResponse.json({ count: typeof payload.count === "number" ? payload.count : 0 }, { status: 200 });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
