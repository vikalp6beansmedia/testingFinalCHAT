"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function SuccessPage() {
  const [creatorHome, setCreatorHome] = useState("/");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        setCreatorHome(`/${d?.profile?.username || "creator"}`);
      })
      .catch(() => {});

    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Nav />
      <main className="container pagePad" style={{ paddingTop: 60, maxWidth: 520 }}>
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.55s cubic-bezier(.22,1,.36,1), transform 0.55s cubic-bezier(.22,1,.36,1)",
          }}
        >
          {/* Glow icon */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <div style={{
              width: 96, height: 96,
              borderRadius: "50%",
              background: "radial-gradient(circle at 40% 35%, rgba(108,142,255,.35), rgba(108,142,255,.06) 70%)",
              border: "1.5px solid rgba(108,142,255,.35)",
              boxShadow: "0 0 40px rgba(108,142,255,.25), inset 0 0 20px rgba(108,142,255,.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 44,
              position: "relative",
            }}>
              🎉
              <div style={{
                position: "absolute",
                width: 10, height: 10, borderRadius: "50%",
                background: "var(--accent)",
                top: -2, right: 10,
                boxShadow: "0 0 8px var(--accent)",
                animation: "successOrbit 3s linear infinite",
              }} />
            </div>
          </div>

          <div className="card" style={{
            padding: 0,
            overflow: "hidden",
            border: "1px solid rgba(108,142,255,.2)",
            background: "linear-gradient(160deg, rgba(108,142,255,.07) 0%, rgba(4,6,18,.95) 60%)",
          }}>
            <div style={{
              height: 3,
              background: "linear-gradient(90deg, transparent, var(--accent), rgba(108,142,255,.3), transparent)",
            }} />

            <div style={{ padding: "36px 32px", textAlign: "center" }}>
              <h1 style={{
                margin: "0 0 10px",
                fontSize: 28, fontWeight: 950, letterSpacing: "-0.5px",
                background: "linear-gradient(135deg, #fff 40%, rgba(108,142,255,.9))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {"You're in!"}
              </h1>
              <p className="muted small" style={{ maxWidth: 360, margin: "0 auto", lineHeight: 1.75 }}>
                Your payment was successful. Your membership is now active — it may take a minute to reflect on your account.
              </p>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                marginTop: 20, padding: "7px 16px", borderRadius: 999,
                background: "rgba(80,220,150,.10)", border: "1px solid rgba(80,220,150,.25)",
                fontSize: 13, fontWeight: 600, color: "rgba(160,255,210,.95)",
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "rgba(80,220,150,.9)", boxShadow: "0 0 6px rgba(80,220,150,.6)",
                  display: "inline-block",
                }} />
                Membership active
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 28 }}>
                <Link href={creatorHome} className="btn btnPrimary full" style={{ fontWeight: 700 }}>
                  Browse exclusive posts →
                </Link>
                <Link href="/membership/chat" className="btn full">
                  💬 Open member chat
                </Link>
              </div>

              <div className="small muted" style={{ marginTop: 22, fontSize: 12, lineHeight: 1.6 }}>
                {"Didn't get access? Refresh the page or "}
                <Link href="/membership/chat" style={{ color: "var(--accent)", fontWeight: 600 }}>
                  contact support
                </Link>.
              </div>
            </div>
          </div>

          <p className="small muted" style={{ textAlign: "center", marginTop: 20, fontSize: 12 }}>
            Thank you for supporting the creator 🌾
          </p>
        </div>
      </main>

      <style>{`
        @keyframes successOrbit {
          from { transform: rotate(0deg) translateX(46px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(46px) rotate(-360deg); }
        }
      `}</style>
    </>
  );
}
