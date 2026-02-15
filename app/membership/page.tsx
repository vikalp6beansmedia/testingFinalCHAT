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

      if (data?.subscriptionId) {
        const ok = await loadRazorpayScript();
        if (!ok || !window.Razorpay) {
          setMsg("Failed to load Razorpay Checkout. Please try again.");
          return;
        }

        const keyId = data?.keyId as string | undefined;
        if (!keyId) {
          setMsg("Missing Razorpay keyId from server.");
          return;
        }

        setMsg("Opening Razorpay Checkout...");

        const options: any = {
          key: keyId,
          subscription_id: data.subscriptionId,
          name: data?.brandName || "CreatorFarm",
          description: data?.description || `${tier} membership`,
          image: data?.logoUrl || undefined,

          redirect: true,
          callback_url: data?.callbackUrl || "/api/razorpay/callback",
          callback_method: "get",

          prefill: data?.customer
            ? {
                name: data.customer.name || "",
                email: data.customer.email || "",
                contact: data.customer.contact || "",
              }
            : undefined,

          notes: data?.notes || { tier },
          theme: { color: "#ffffff" },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (resp: any) => {
          setMsg(resp?.error?.description || "Payment failed.");
        });

        rzp.open();
        return;
      }

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
    <>
      <Nav />

      <div className="container mobile-shell pagePad" style={{ marginTop: 14 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: 0 }}>Membership</h1>
              <div className="small muted" style={{ marginTop: 6 }}>
                Choose a tier to start a Razorpay subscription. You must be signed in.
              </div>
            </div>
            <a className="btn" href="/" style={{ display: "inline-flex", alignItems: "center", height: 44 }}>
              Back to feed
            </a>
          </div>

          <div className="hr" />

          <div className="grid3">
            <div className="card" style={{ padding: 14, background: "rgba(255,255,255,.04)" }}>
              <div style={{ fontWeight: 950, fontSize: 16 }}>Basic</div>
              <div className="small muted" style={{ marginTop: 6 }}>
                Unlock <b>BASIC</b> posts + member chat.
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                <div className="notice small">
                  • Locked posts become <b>unblurred</b>
                  <br />• Access to <b>/membership/chat</b>
                </div>
                <button onClick={() => join("BASIC")} className="btn btnPrimary full">
                  Join Basic
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: 14, background: "rgba(255,255,255,.04)" }}>
              <div style={{ fontWeight: 950, fontSize: 16 }}>Pro</div>
              <div className="small muted" style={{ marginTop: 6 }}>
                Unlock <b>PRO</b> posts (includes BASIC) + member chat.
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                <div className="notice small">
                  • Everything in <b>Basic</b>
                  <br />• Highest access for locked drops
                </div>
                <button onClick={() => join("PRO")} className="btn btnPrimary full">
                  Join Pro
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: 14, background: "rgba(0,0,0,.18)" }}>
              <div style={{ fontWeight: 900 }}>Note</div>
              <div className="small muted" style={{ marginTop: 8 }}>
                If you get <b>“Missing plan id”</b>, open <b>Admin → Settings</b> and save both Razorpay plan IDs.
              </div>

              <div className="hr" />

              <div className="small muted">
                After payment success, you&apos;ll be redirected back and your tier updates once webhook confirms.
              </div>
            </div>
          </div>

          {msg ? (
            <div className="notice" style={{ marginTop: 14 }}>
              <div className="small">{msg}</div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
