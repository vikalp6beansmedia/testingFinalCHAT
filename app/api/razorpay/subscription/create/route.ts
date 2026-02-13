import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeTrim(v: string | undefined | null) {
  return (v ?? "").trim();
}

function siteOrigin() {
  // Prefer explicit env, else fallback to current deployed domain
  const envUrl = safeTrim(process.env.NEXTAUTH_URL);
  if (envUrl) return envUrl.replace(/\/+$/, "");
  // fallback for your project (works even if NEXTAUTH_URL missing)
  return "https://creator-farm-phase6-razorpay-2-y8ua.vercel.app";
}

export async function POST(req: Request) {
  try {
    // 1) Must be signed in
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase().trim() || "";
    const userId = (session as any)?.uid as string | undefined;

    if (!email || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in DB (prevents FK issues later)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // 2) Read tier from body
    const body = await req.json().catch(() => ({}));
    const tier = String(body?.tier || "").toUpperCase(); // BASIC | PRO

    if (tier !== "BASIC" && tier !== "PRO") {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // 3) Load plan IDs from DB (saved from Admin → Settings)
    const settings = await prisma.tierSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: {},
      select: {
        currency: true,
        razorpayBasicPlanId: true,
        razorpayProPlanId: true,
        basicPrice: true,
        proPrice: true,
      },
    });

    const planId =
      tier === "BASIC" ? settings.razorpayBasicPlanId : settings.razorpayProPlanId;

    if (!planId) {
      return NextResponse.json({ error: "Missing plan id" }, { status: 400 });
    }

    // 4) Read Razorpay keys from env (trim!)
    const keyId = safeTrim(process.env.RAZORPAY_KEY_ID);
    const keySecret = safeTrim(process.env.RAZORPAY_KEY_SECRET);

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Missing Razorpay keys" }, { status: 500 });
    }

    // 5) Create subscription using Razorpay REST API (no SDK)
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const payload = {
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 120,
      notes: {
        // webhook/callback will read this and link to correct user
        userId,
        tier,
        email,
      },
    };

    const rpRes = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const rpJson = await rpRes.json().catch(() => ({}));

    if (!rpRes.ok) {
      console.log("RZP create subscription failed:", rpRes.status, rpJson);
      return NextResponse.json(
        {
          error: rpJson?.error?.description || "Razorpay error",
          raw: rpJson,
          statusCode: rpRes.status,
        },
        { status: 500 }
      );
    }

    // ✅ NEW: Provide callback URL for redirect after successful payment
    const callbackUrl = `${siteOrigin()}/api/razorpay/callback`;

    // ✅ Return what frontend needs to open Razorpay Checkout
    return NextResponse.json({
      subscriptionId: rpJson.id,
      status: rpJson.status,
      planId: rpJson.plan_id || planId,

      // required by Checkout
      keyId,
      callbackUrl,

      // optional nice-to-have for prefill
      customer: {
        name: user.name || "",
        email: user.email || email,
      },

      // keep notes in frontend too (useful for debugging)
      notes: {
        userId,
        tier,
        email,
      },

      // Keep shortUrl as fallback (your UI still supports it)
      shortUrl: rpJson.short_url || null,
    });
  } catch (e: any) {
    console.log("Subscription route crashed:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
