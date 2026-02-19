"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Nav from "@/components/Nav";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setMsg({ text: "Passwords don't match.", ok: false });
      return;
    }
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ text: data?.error || "Reset failed.", ok: false });
      } else {
        setMsg({ text: "Password updated! Redirecting to sign in…", ok: true });
        setTimeout(() => router.push("/signin"), 2000);
      }
    } catch {
      setMsg({ text: "Something went wrong. Please try again.", ok: false });
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="errorBox" style={{ marginTop: 12 }}>
        <div className="small">Invalid reset link. Please request a new one from the <a href="/forgot-password"><b>forgot password</b></a> page.</div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 14 }}>
      <input
        className="input"
        type="password"
        placeholder="New password (min 6 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      <input
        className="input"
        type="password"
        placeholder="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
      />
      <button disabled={loading} type="submit" className="btn btnPrimary full">
        {loading ? "Updating…" : "Set new password"}
      </button>
      {msg && (
        <div className={msg.ok ? "notice" : "errorBox"}>
          <div className="small">{msg.text}</div>
        </div>
      )}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Nav />
      <div className="container mobile-shell pagePad" style={{ marginTop: 14 }}>
        <div className="card" style={{ padding: 18, maxWidth: 520, margin: "0 auto" }}>
          <h1 style={{ marginTop: 0 }}>Set new password</h1>
          <div className="small muted">Enter and confirm your new password.</div>
          <Suspense fallback={<div className="small muted" style={{ marginTop: 14 }}>Loading…</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}
