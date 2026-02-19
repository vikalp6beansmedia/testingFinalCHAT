"use client";

import { useState } from "react";
import Nav from "@/components/Nav";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      await res.json();
      // Always show success to not reveal if email exists
      setMsg({ text: "If an account with that email exists, we've sent a reset link. Check your inbox.", ok: true });
    } catch {
      setMsg({ text: "Something went wrong. Please try again.", ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <div className="container mobile-shell pagePad" style={{ marginTop: 14 }}>
        <div className="card" style={{ padding: 18, maxWidth: 520, margin: "0 auto" }}>
          <h1 style={{ marginTop: 0 }}>Forgot password</h1>
          <div className="small muted">Enter your email and we'll send you a reset link.</div>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 14 }}>
            <input
              className="input"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button disabled={loading} type="submit" className="btn btnPrimary full">
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>

          {msg && (
            <div className={msg.ok ? "notice" : "errorBox"} style={{ marginTop: 12 }}>
              <div className="small">{msg.text}</div>
            </div>
          )}

          <div className="small muted" style={{ marginTop: 14 }}>
            Remember your password? <a href="/signin"><b>Sign in</b></a>
          </div>
        </div>
      </div>
    </>
  );
}
