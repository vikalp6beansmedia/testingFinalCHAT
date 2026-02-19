"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Nav from "@/components/Nav";
import Link from "next/link";

declare global { interface Window { Razorpay?: any; } }
const RZP_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = RZP_SRC; s.async = true;
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function MembershipPage() {
  const { data: session } = useSession();
  const isSignedIn = !!session;
  const currentTier = (session as any)?.tier ?? "NONE";

  const [settings, setSettings] = useState<{ basicPrice: number; proPrice: number } | null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      setSettings({ basicPrice: d.basicPrice ?? 999, proPrice: d.proPrice ?? 1999 });
    }).catch(() => setSettings({ basicPrice: 999, proPrice: 1999 }));
  }, []);

  async function join(tier: "BASIC" | "PRO") {
    if (!isSignedIn) { window.location.href = "/signin"; return; }
    setLoading(true);
    setMsg("Creating subscription…");
    try {
      const res = await fetch("/api/razorpay/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data?.error || "Failed. Please try again."); setLoading(false); return; }

      if (data?.subscriptionId) {
        const ok = await loadRazorpay();
        if (!ok || !window.Razorpay) { setMsg("Failed to load Razorpay. Please try again."); setLoading(false); return; }
        setMsg("Opening payment…");
        const rzp = new window.Razorpay({
          key: data.keyId,
          subscription_id: data.subscriptionId,
          name: "CreatorFarm",
          description: `${tier} membership`,
          redirect: true,
          callback_url: data.callbackUrl,
          callback_method: "get",
          prefill: data.customer ? { name: data.customer.name, email: data.customer.email } : {},
          notes: data.notes,
          theme: { color: "#6c8eff" },
        });
        rzp.on("payment.failed", (r: any) => { setMsg(r?.error?.description || "Payment failed."); setLoading(false); });
        rzp.open();
        return;
      }
      setMsg(data?.error || "Unexpected response.");
    } catch (e: any) {
      setMsg(e?.message || "Error");
    }
    setLoading(false);
  }

  const plans = [
    {
      id: "BASIC" as const,
      name: "Basic",
      price: settings?.basicPrice ?? 999,
      perks: ["Unlock all Basic posts", "Member chat with creator", "Early access drops", "Discord community"],
      color: "rgba(108,142,255,.15)",
      border: "rgba(108,142,255,.3)",
    },
    {
      id: "PRO" as const,
      name: "Pro",
      price: settings?.proPrice ?? 1999,
      perks: ["Everything in Basic", "Unlock Pro exclusive posts", "Priority chat replies", "Behind-the-scenes content", "Monthly Q&A access"],
      color: "rgba(255,200,80,.10)",
      border: "rgba(255,200,80,.3)",
      highlight: true,
    },
  ];

  return (
    <>
      <Nav />
      <main className="container pagePad" style={{ paddingTop: 24 }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 950, margin: "0 0 10px" }}>Unlock everything</h1>
          <p className="muted" style={{ maxWidth: 480, margin: "0 auto" }}>
            Get access to exclusive content, member-only chat, and premium drops.
          </p>
        </div>

        {/* Current tier banner */}
        {isSignedIn && currentTier !== "NONE" && (
          <div className="successBox" style={{ marginBottom: 20, textAlign: "center" }}>
            <div className="small">You're on the <b>{currentTier}</b> plan. Thank you for supporting!</div>
          </div>
        )}

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, maxWidth: 680, margin: "0 auto" }}>
          {plans.map(plan => (
            <div key={plan.id} className="card" style={{ padding: 24, background: plan.color, borderColor: plan.border, position: "relative" }}>
              {plan.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "rgba(255,200,80,.9)", color: "#000", fontWeight: 800, fontSize: 11, padding: "4px 12px", borderRadius: 99, whiteSpace: "nowrap" }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ fontWeight: 900, fontSize: 22 }}>{plan.name}</div>
              <div style={{ fontSize: 32, fontWeight: 950, margin: "12px 0 4px" }}>
                ₹{plan.price}
                <span className="small muted" style={{ fontWeight: 500, fontSize: 14 }}>/month</span>
              </div>
              <div className="hr" />
              <ul style={{ margin: "0 0 20px", padding: "0 0 0 4px", listStyle: "none", display: "grid", gap: 8 }}>
                {plan.perks.map(p => (
                  <li key={p} className="small" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "rgba(80,220,150,.9)", fontWeight: 700 }}>✓</span> {p}
                  </li>
                ))}
              </ul>
              <button
                className={"btn full" + (plan.highlight ? " btnPrimary" : "")}
                onClick={() => join(plan.id)}
                disabled={loading || currentTier === plan.id}
                style={plan.highlight ? {} : { border: `1px solid ${plan.border}` }}
              >
                {currentTier === plan.id ? "Current plan" : loading ? "Please wait…" : `Join ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {msg && (
          <div className="notice" style={{ marginTop: 20, maxWidth: 480, margin: "20px auto 0", textAlign: "center" }}>
            <div className="small">{msg}</div>
          </div>
        )}

        {!isSignedIn && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link href="/signin" className="btn btnPrimary">Sign in to subscribe</Link>
            <div className="small muted" style={{ marginTop: 10 }}>
              No account? <Link href="/signup"><b>Create one free</b></Link>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div style={{ maxWidth: 580, margin: "40px auto 0" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>FAQ</h2>
          {[
            ["How do I cancel?", "You can cancel anytime from your Razorpay account. You'll keep access until the end of the billing period."],
            ["What payment methods are accepted?", "All major cards, UPI, net banking, and wallets via Razorpay."],
            ["Can I upgrade from Basic to Pro?", "Yes — cancel your Basic plan and subscribe to Pro. Contact us in chat for help."],
            ["Will I get a refund if I cancel?", "Subscriptions are non-refundable for the current period. You'll have access until it ends."],
          ].map(([q, a]) => (
            <div key={q} className="card" style={{ padding: 16, marginBottom: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{q}</div>
              <div className="small muted">{a}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="siteFooter">
        <span className="small muted">© {new Date().getFullYear()} CreatorFarm</span>
        <div className="footerLinks">
          <a href="/terms" className="footerLink">Terms</a>
          <a href="/privacy" className="footerLink">Privacy</a>
        </div>
      </footer>
    </>
  );
}
