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

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7.25" stroke="rgba(80,220,150,.45)" strokeWidth="1.5"/>
    <path d="M4.5 8.5L6.5 10.5L11 5.5" stroke="rgba(80,220,150,.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MembershipPage() {
  const { data: session } = useSession();
  const isSignedIn = !!session;
  const currentTier = (session as any)?.tier ?? "NONE";

  const [settings, setSettings] = useState<{ basicPrice: number; proPrice: number } | null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      setSettings({ basicPrice: d.basicPrice ?? 999, proPrice: d.proPrice ?? 1999 });
    }).catch(() => setSettings({ basicPrice: 999, proPrice: 1999 }));
  }, []);

  async function join(tier: "BASIC" | "PRO") {
    if (!isSignedIn) { window.location.href = "/signin"; return; }
    setLoading(true);
    setLoadingTier(tier);
    setMsg("Creating subscription…");
    try {
      const res = await fetch("/api/razorpay/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data?.error || "Failed. Please try again."); setLoading(false); setLoadingTier(null); return; }

      if (data?.subscriptionId) {
        const ok = await loadRazorpay();
        if (!ok || !window.Razorpay) { setMsg("Failed to load Razorpay. Please try again."); setLoading(false); setLoadingTier(null); return; }
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
        rzp.on("payment.failed", (r: any) => { setMsg(r?.error?.description || "Payment failed."); setLoading(false); setLoadingTier(null); });
        rzp.open();
        return;
      }
      setMsg(data?.error || "Unexpected response.");
    } catch (e: any) {
      setMsg(e?.message || "Error");
    }
    setLoading(false);
    setLoadingTier(null);
  }

  const plans = [
    {
      id: "BASIC" as const,
      name: "Basic",
      emoji: "⭐",
      price: settings?.basicPrice ?? 999,
      tagline: "Unlock the essentials",
      perks: [
        "All Basic posts & videos",
        "1:1 chat with the creator",
        "Early access to new drops",
        "Member-only community",
      ],
      accent: "rgba(108,142,255,1)",
      accentBg: "rgba(108,142,255,.08)",
      accentBorder: "rgba(108,142,255,.25)",
      accentGlow: "rgba(108,142,255,.15)",
    },
    {
      id: "PRO" as const,
      name: "Pro",
      emoji: "🔥",
      price: settings?.proPrice ?? 1999,
      tagline: "The full experience",
      perks: [
        "Everything in Basic",
        "Pro-exclusive content",
        "Priority chat replies",
        "Behind-the-scenes access",
        "Monthly live Q&A",
      ],
      accent: "rgba(255,185,50,1)",
      accentBg: "rgba(255,185,50,.08)",
      accentBorder: "rgba(255,185,50,.28)",
      accentGlow: "rgba(255,185,50,.12)",
      highlight: true,
    },
  ];

  return (
    <>
      <Nav />

      <main className="container pagePad" style={{ paddingTop: 40 }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{
            display: "inline-block",
            padding: "5px 14px", borderRadius: 999,
            background: "rgba(108,142,255,.10)",
            border: "1px solid rgba(108,142,255,.22)",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
            color: "rgba(180,200,255,.85)",
            marginBottom: 16, textTransform: "uppercase",
          }}>
            Membership
          </div>
          <h1 style={{
            margin: "0 0 12px",
            fontSize: "clamp(28px, 6vw, 42px)",
            fontWeight: 950,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            background: "linear-gradient(135deg, #fff 30%, rgba(180,200,255,.7))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Unlock everything
          </h1>
          <p className="muted" style={{ maxWidth: 440, margin: "0 auto", lineHeight: 1.7, fontSize: 15 }}>
            Exclusive content, direct creator chat, and member-only drops — pick the plan that works for you.
          </p>
        </div>

        {/* ── Current plan banner ── */}
        {isSignedIn && currentTier !== "NONE" && (
          <div style={{
            maxWidth: 640, margin: "0 auto 28px",
            padding: "12px 20px",
            borderRadius: 12,
            background: "rgba(80,220,150,.07)",
            border: "1px solid rgba(80,220,150,.2)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <span className="small">
              {"You're on the "}
              <b style={{ color: "rgba(160,255,210,.95)" }}>{currentTier}</b>
              {" plan — thank you for your support!"}
            </span>
          </div>
        )}

        {/* ── Plans grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
          gap: 16,
          maxWidth: 680,
          margin: "0 auto",
        }}>
          {plans.map(plan => (
            <div
              key={plan.id}
              className="card"
              style={{
                padding: 0, overflow: "hidden",
                background: plan.accentBg,
                borderColor: plan.accentBorder,
                position: "relative",
                boxShadow: plan.highlight
                  ? `0 0 40px ${plan.accentGlow}, 0 20px 60px rgba(0,0,0,.4)`
                  : "0 20px 60px rgba(0,0,0,.35)",
                transition: "transform .2s, box-shadow .2s",
              }}
            >
              {/* Top line */}
              <div style={{
                height: 3,
                background: `linear-gradient(90deg, transparent, ${plan.accent}, transparent)`,
                opacity: plan.highlight ? 1 : 0.5,
              }} />

              {plan.highlight && (
                <div style={{
                  position: "absolute", top: 16, right: 16,
                  background: `linear-gradient(135deg, rgba(255,185,50,.95), rgba(255,150,30,.9))`,
                  color: "#000",
                  fontWeight: 800, fontSize: 10,
                  padding: "4px 10px", borderRadius: 99,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  Most popular
                </div>
              )}

              <div style={{ padding: "24px 24px 28px" }}>
                {/* Plan header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 22 }}>{plan.emoji}</span>
                  <span style={{ fontWeight: 900, fontSize: 20 }}>{plan.name}</span>
                </div>
                <div className="small muted" style={{ marginBottom: 20 }}>{plan.tagline}</div>

                {/* Price */}
                <div style={{ marginBottom: 22 }}>
                  <span style={{
                    fontSize: 36, fontWeight: 950, letterSpacing: "-0.03em",
                    color: plan.highlight ? "rgba(255,200,80,.95)" : "#fff",
                  }}>
                    ₹{(settings ? (plan.id === "BASIC" ? settings.basicPrice : settings.proPrice) : plan.price).toLocaleString("en-IN")}
                  </span>
                  <span className="small muted" style={{ marginLeft: 6, fontSize: 13 }}>/month</span>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(255,255,255,.07)", marginBottom: 18 }} />

                {/* Perks */}
                <ul style={{ margin: "0 0 24px", padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                  {plan.perks.map(p => (
                    <li key={p} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {CHECK}
                      <span className="small" style={{ lineHeight: 1.4 }}>{p}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className="btn full"
                  onClick={() => join(plan.id)}
                  disabled={loading || currentTier === plan.id}
                  style={{
                    background: plan.highlight
                      ? "linear-gradient(135deg, rgba(255,185,50,.95), rgba(255,140,30,.85))"
                      : "rgba(108,142,255,.2)",
                    border: `1px solid ${plan.accentBorder}`,
                    color: plan.highlight ? "#000" : "#fff",
                    fontWeight: 800,
                    fontSize: 14,
                    letterSpacing: "0.01em",
                    minHeight: 48,
                  }}
                >
                  {currentTier === plan.id
                    ? "✓ Current plan"
                    : loadingTier === plan.id
                    ? "Please wait…"
                    : `Join ${plan.name} →`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Status msg */}
        {msg && (
          <div className="notice" style={{
            maxWidth: 480, margin: "20px auto 0",
            textAlign: "center", fontSize: 13,
          }}>
            {msg}
          </div>
        )}

        {/* Sign in nudge */}
        {!isSignedIn && (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/signin" className="btn btnPrimary">Sign in to subscribe</Link>
            <div className="small muted" style={{ marginTop: 10 }}>
              {"No account? "}
              <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>Create one free</Link>
            </div>
          </div>
        )}

        {/* ── Trust strip ── */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 20px",
          maxWidth: 560, margin: "36px auto 0",
          padding: "16px 20px",
          borderRadius: 12,
          background: "rgba(255,255,255,.03)",
          border: "1px solid rgba(255,255,255,.07)",
        }}>
          {[
            "🔒 Razorpay secured",
            "🇮🇳 UPI & cards accepted",
            "↩ Cancel anytime",
            "⚡ Instant access",
          ].map(t => (
            <span key={t} className="small muted" style={{ fontSize: 12 }}>{t}</span>
          ))}
        </div>

        {/* ── FAQ ── */}
        <div style={{ maxWidth: 580, margin: "44px auto 0" }}>
          <h2 style={{
            fontSize: 18, fontWeight: 800, marginBottom: 16,
            letterSpacing: "-0.02em",
          }}>
            Frequently asked questions
          </h2>
          {[
            ["How do I cancel?", "Cancel anytime from your Razorpay account. You keep access until the end of the billing period."],
            ["What payment methods are accepted?", "All major cards, UPI, net banking, and wallets via Razorpay."],
            ["Can I upgrade from Basic to Pro?", "Yes — cancel Basic and subscribe to Pro. Reach out in chat if you need help with the transition."],
            ["Will I get a refund if I cancel?", "Subscriptions are non-refundable for the current period. Access continues until it ends."],
          ].map(([q, a]) => (
            <div key={q} style={{
              padding: "14px 18px",
              marginBottom: 8,
              borderRadius: 12,
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.08)",
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{q}</div>
              <div className="small muted" style={{ lineHeight: 1.6 }}>{a}</div>
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
