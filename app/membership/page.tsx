"use client";

import { useState } from "react";
import Nav from "@/components/Nav";

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

      // If Razorpay returns short_url, open it
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
            Click a tier to create a Razorpay subscription (server-side). You must be signed in.
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
