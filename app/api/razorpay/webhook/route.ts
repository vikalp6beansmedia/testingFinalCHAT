// app/api/razorpay/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifySignature(rawBody: string, signatureHex: string, secret: string) {
  const expectedHex = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  // Razorpay signature is hex. Compare bytes, not ascii strings.
  const expected = Buffer.from(expectedHex, "hex");
  const signature = Buffer.from((signatureHex || "").trim(), "hex");

  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(expected, signature);
}

function shouldActivateTier(status: string | undefined) {
  return (status || "").toLowerCase() === "active";
}

function shouldCancelTier(status: string | undefined) {
  const s = (status || "").toLowerCase();
  return ["cancelled", "expired", "completed", "halted"].includes(s);
}

export async function POST(req: Request) {
  const secret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();

  try {
    if (!secret) {
      return NextResponse.json({ error: "Missing RAZORPAY_WEBHOOK_SECRET in env" }, { status: 500 });
    }

    const signature = req.headers.get("x-razorpay-signature") || "";
    const rawBody = await req.text();

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const ok = verifySignature(rawBody, signature, secret);
    if (!ok) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event?.event || "";

    const sub = event?.payload?.subscription?.entity;
    const pay = event?.payload?.payment?.entity;

    // Notes can appear on subscription entity
    const notes = sub?.notes || pay?.notes || {};
    const userIdFromNotes = typeof notes?.userId === "string" ? notes.userId : null;
    const tierFromNotes = typeof notes?.tier === "string" ? notes.tier.toUpperCase() : null;

    const emailFromNotesRaw =
      notes?.email || notes?.app_user_email || notes?.user_email || null;
    const emailFromNotes =
      typeof emailFromNotesRaw === "string" ? emailFromNotesRaw.toLowerCase().trim() : null;

    // Resolve user (best: userId, fallback: email)
    let userId: string | null = null;
    if (userIdFromNotes) {
      const u = await prisma.user.findUnique({ where: { id: userIdFromNotes }, select: { id: true } });
      userId = u?.id ?? null;
    }
    if (!userId && emailFromNotes) {
      const u = await prisma.user.findUnique({ where: { email: emailFromNotes }, select: { id: true } });
      userId = u?.id ?? null;
    }

    // ---- subscription events ----
    const isSubEvent = [
      "subscription.activated",
      "subscription.resumed",
      "subscription.paused",
      "subscription.cancelled",
      "subscription.completed",
      "subscription.halted",
    ].includes(eventType);

    if (isSubEvent) {
      if (!sub?.id) {
        return NextResponse.json({ ok: true, note: "No subscription entity" });
      }

      const tier = tierFromNotes === "BASIC" || tierFromNotes === "PRO" ? tierFromNotes : "NONE";
      const status = sub.status || eventType;

      // Upsert subscription record (do NOT write invalid userId)
      await prisma.subscription.upsert({
        where: { razorpaySubscriptionId: sub.id },
        create: {
          razorpaySubscriptionId: sub.id,
          tier: tier as any,
          status,
          userId: userId ?? null,
          currentPeriodEnd: sub.current_end_at ? new Date(sub.current_end_at * 1000) : null,
        },
        update: {
          tier: tier as any,
          status,
          userId: userId ?? undefined,
          currentPeriodEnd: sub.current_end_at ? new Date(sub.current_end_at * 1000) : null,
        },
      });

      // Update user's tier if we can resolve userId
      if (userId) {
        let nextTier: "NONE" | "BASIC" | "PRO" = "NONE";
        if (shouldActivateTier(sub.status)) nextTier = tier as any;
        if (shouldCancelTier(sub.status)) nextTier = "NONE";
        if ((sub.status || "").toLowerCase() === "paused") {
          // keep current tier on pause
          const cur = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } });
          nextTier = (cur?.tier as any) ?? "NONE";
        }

        await prisma.user.update({
          where: { id: userId },
          data: { tier: nextTier as any },
        });
      }

      return NextResponse.json({ ok: true, handled: eventType });
    }

    // ---- payment events ----
    const isPayEvent = ["payment.captured", "payment.failed"].includes(eventType);

    if (isPayEvent) {
      if (!pay?.id) {
        return NextResponse.json({ ok: true, note: "No payment entity" });
      }

      const razorpayPaymentId = pay.id;
      const razorpayOrderId = pay.order_id || null;
      const razorpaySubscriptionId = pay.subscription_id || null;

      if (razorpaySubscriptionId) {
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId },
          data: {
            razorpayPaymentId,
            razorpayOrderId,
            lastPaymentStatus: eventType === "payment.captured" ? "paid" : "failed",
            lastPaymentAt: new Date(),
            ...(eventType === "payment.captured" ? { status: "active" } : {}),
            ...(userId ? { userId } : {}),
          },
        });

        // Ensure user's tier is set after first successful payment (if webhook ordering is weird)
        if (eventType === "payment.captured" && userId) {
          const tier = tierFromNotes === "BASIC" || tierFromNotes === "PRO" ? tierFromNotes : null;
          if (tier) {
            await prisma.user.update({
              where: { id: userId },
              data: { tier: tier as any },
            });
          }
        }
      }

      return NextResponse.json({ ok: true, handled: eventType });
    }

    return NextResponse.json({ ok: true, ignored: eventType });
  } catch (e: any) {
    console.error("Webhook error:", e?.message || e);
    // return 200 so Razorpay doesn't retry infinitely while you're debugging
    return NextResponse.json({ ok: true, error: e?.message || "Webhook error" }, { status: 200 });
  }
}
