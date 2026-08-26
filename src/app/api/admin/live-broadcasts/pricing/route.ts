import { NextResponse } from "next/server";
import { backendBaseUrl, buildBackendSessionHeaders, extractSetCookieHeaders } from "@/core/auth/backend";

const CURRENCY_PATTERN = /^[A-Za-z]{3}$/;

export async function POST(req: Request) {
  const formData = await req.formData();
  const currency = ((formData.get("currency") as string | null) ?? "").trim().toUpperCase();
  const rawAmount = ((formData.get("amount") as string | null) ?? "").trim();
  const amountMajor = Number.parseFloat(rawAmount);

  if (!CURRENCY_PATTERN.test(currency) || !Number.isFinite(amountMajor) || amountMajor <= 0) {
    return NextResponse.redirect(new URL("/live-broadcasts/policy?section=pricing&state=validation", req.url), 303);
  }

  // Backend stores minor units (kobo/cents); the admin types a normal
  // major-unit price, same convention as Premium's own pricing form.
  const amountMinor = Math.round(amountMajor * 100);

  const backendResponse = await fetch(`${backendBaseUrl}/live-broadcasts/admin/pricing/set/`, {
    method: "POST",
    headers: buildBackendSessionHeaders(req, true),
    body: JSON.stringify({ currency, price_per_1000_minutes: amountMinor }),
    cache: "no-store",
  });

  const targetState = backendResponse.status === 400 ? "validation" : backendResponse.ok ? "success" : "error";
  const redirect = NextResponse.redirect(
    new URL(`/live-broadcasts/policy?section=pricing&state=${targetState}`, req.url),
    303,
  );
  for (const header of extractSetCookieHeaders(backendResponse)) {
    redirect.headers.append("set-cookie", header);
  }
  return redirect;
}
