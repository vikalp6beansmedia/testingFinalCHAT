"use client";

import { useState } from "react";
import Nav from "@/components/Nav";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const RZP_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector(`script[src="${RZP_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = RZP_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function MembershipPage() {
  const [msg, setMsg] = useState<string>("");

  async function join(tier: "BASIC" | "PRO") {
    setMsg("Creating subscription...");

    try {
      const res = await fetch("/api/razorpay/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMsg(data?.details || data?.error || "Failed (unknown)");
        return;
      }

      // Preferred flow: open Razorpay Checkout with subscription_id (supports callback_url redirect)
      // Expect backend to return:
      // { subscriptionId, keyId, callbackUrl, customer?: { name,email,contact }, notes?: {...} }
      if (data?.subscriptionId) {
        const ok = await loadRazorpayScript();
        if (!ok || !window.Razorpay) {
          setMsg("Failed to load Razorpay Checkout. Please try again.");
          return;
        }

        const keyId =
          data?.keyId || (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string | undefined);

        if (!keyId) {
          setMsg(
            "Missing Razorpay keyId. (We will update the create API to return keyId.)"
          );
          return;
        }

        setMsg("Opening Razorpay Checkout...");

        const options: any = {
          key: keyId,
          subscription_id: data.subscriptionId,
          name: data?.brandName || "CreatorFarm",
          description: data?.description || `${tier} membership`,
          image: data?.logoUrl || undefined,

          // THIS enables redirect back to your site after success
          redirect: true,
          callback_url: data?.callbackUrl || "/api/razorpay/callback",

          prefill: data?.customer
            ? {
                name: data.customer.name || "",
                email: data.customer.email || "",
                contact: data.customer.contact || "",
              }
            : undefined,

          notes: data?.notes || { tier },

          theme: { color: "#2563eb" },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (resp: any) => {
          setMsg(resp?.error?.description || "Payment failed.");
        });

        rzp.open();
        return;
      }

      // Fallback: older flow using Razorpay short URL (kept as backup)
      if (data?.shortUrl) {
        setMsg("Opening Razorpay...");
        window.location.href = data.shortUrl;
        return;
      }

      setMsg(`Created: ${data?.subscriptionId || "OK"}`);
    } catch (e: any) {
      setMsg(e?.message || "Failed");
    }
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl">
          <h1 className="text-3xl font-semibold text-white">Membership</h1>
          <p className="mt-2 text-white/70">
            Click a tier to start a Razorpay subscription. You must be signed in.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-xl font-semibold text-white">Basic</div>
              <div className="mt-1 text-white/70">Unlock BASIC posts.</div>
              <button
                onClick={() => join("BASIC")}
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500"
              >
                Join Basic
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-xl font-semibold text-white">Pro</div>
              <div className="mt-1 text-white/70">Unlock PRO posts (includes BASIC).</div>
              <button
                onClick={() => join("PRO")}
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500"
              >
                Join Pro
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-xl font-semibold text-white">Note</div>
              <div className="mt-2 text-white/70">
                If you get “Missing plan id”, open Admin → Settings and save both plan IDs.
              </div>
            </div>
          </div>

          <div className="mt-6 text-white/80">{msg}</div>
        </div>
      </div>
    </div>
  );
}
