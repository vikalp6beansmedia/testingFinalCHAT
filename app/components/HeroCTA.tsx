"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function HeroCTA() {
  const { data, status } = useSession();
  const tier = (data as any)?.tier ?? "NONE";
  const isPaid = tier === "BASIC" || tier === "PRO";
  const isSignedIn = !!data;
  const loading = status === "loading";

  if (loading) return <div style={{ height: 80 }} />;

  // ── Paid member ──────────────────────────────────────────
  if (isPaid) {
    return (
      <div style={{ marginTop: 18 }}>
        <div className="successBox" style={{ textAlign: "center", marginBottom: 12 }}>
          <div className="small">
            ✓ You're on <b>{tier}</b> — all your posts are unlocked below 👇
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Link href="/membership/chat" className="btn btnPrimary full" style={{ justifyContent: "center" }}>
            💬 Open chat
          </Link>
          <Link href="/membership" className="btn full" style={{ justifyContent: "center" }}>
            Manage plan
          </Link>
        </div>
      </div>
    );
  }

  // ── Signed in but free ───────────────────────────────────
  if (isSignedIn) {
    return (
      <div style={{ marginTop: 18 }}>
        <div className="notice" style={{ textAlign: "center", marginBottom: 12 }}>
          <div className="small muted">You're signed in on the free plan — subscribe to unlock all posts.</div>
        </div>
        <Link href="/membership" className="btn btnPrimary full" style={{ justifyContent: "center" }}>
          ⭐ Upgrade to unlock
        </Link>
      </div>
    );
  }

  // ── Not signed in ────────────────────────────────────────
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Link href="/membership" className="btn btnPrimary full" style={{ justifyContent: "center" }}>
          ⭐ Unlock access
        </Link>
        <Link href="/signup" className="btn full" style={{ justifyContent: "center" }}>
          Join free
        </Link>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
        <span className="small muted">Already a member?</span>
        <Link href="/signin" className="btn btnSm" style={{ minHeight: 32, padding: "6px 14px", fontSize: 13 }}>
          Sign in
        </Link>
      </div>
    </div>
  );
}
