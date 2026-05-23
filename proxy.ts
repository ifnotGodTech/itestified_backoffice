import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveAccess } from "@/core/auth/access";
import { getRequestSession } from "@/core/auth/session";

export async function proxy(req: NextRequest) {
  if (process.env.E2E_BYPASS_AUTH === "1") {
    return NextResponse.next();
  }

  const pathname = req.nextUrl.pathname;
  const session = await getRequestSession(req);
  const decision = resolveAccess(pathname, session);

  if (decision.action === "allow") {
    return NextResponse.next();
  }

  const url = new URL(decision.destination, req.url);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/signup",
    "/create-password",
    "/accept-invite",
    "/reset-temporary-password",
    "/login",
    "/forgot-password",
    "/overview/:path*",
    "/admin/:path*",
  ],
};
