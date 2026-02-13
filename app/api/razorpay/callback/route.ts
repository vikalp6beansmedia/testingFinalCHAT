import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeTrim(v: string | undefined | null) {
  return (v ?? "").trim();
}

function siteOrigin() {
  const envUrl = safeTrim(process.env.NEXTAUTH_URL);
  if (envUrl) return envUrl.replace(/\/+$/, "");
  return "https://creator-farm-phase6-razorpay-2-y8ua.vercel.app";
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const paymentId = url.searchParams.get("razorpay_payment_id") || "";
  const subscriptionId = url.searchParams.get("razorpay_subscription_id") || "";
  const signature = url.searchParams.get("razorpay_signature") || "";

  const dest = new URL(`${siteOrigin()}/membership/success`);
  if (paymentId) dest.searchParams.set("paymentId", paymentId);
  if (subscriptionId) dest.searchParams.set("subscriptionId", subscriptionId);
  if (signature) dest.searchParams.set("sig", signature);

  return NextResponse.redirect(dest, { status: 302 });
}
