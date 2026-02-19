"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email, password, redirect: false,
      });
      if (res?.error) {
        setMsg({ text: "Incorrect email or password.", ok: false });
      } else {
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setMsg(null);
    await signIn("google", { callbackUrl: "/" });
  }

  async function onMagic(e: React.FormEvent) {
    e.preventDefault();
    if (!magicEmail.trim()) { setMsg({ text: "Enter your email.", ok: false }); return; }
    setMsg(null);
    setLoading(true);
    try {
      const res = await signIn("email", { email: magicEmail.trim(), redirect: false });
      if (res?.error) setMsg({ text: "Could not send magic link. Check email config.", ok: false });
      else setMsg({ text: "Magic link sent! Check your inbox.", ok: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="container pagePad" style={{ maxWidth: 480, paddingTop: 32 }}>
        <div className="card" style={{ padding: 28 }}>
          <h1 style={{ marginTop: 0, fontSize: 24 }}>Sign in</h1>

          {/* Google */}
          <button className="btn full" onClick={onGoogle} style={{ gap: 10, marginBottom: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="dividerText" style={{ margin: "16px 0" }}>or</div>

          {/* Tabs */}
          <div className="tabRow" style={{ marginBottom: 16 }}>
            <button className={"tab" + (tab === "password" ? " tabActive" : "")} onClick={() => setTab("password")}>Password</button>
            <button className={"tab" + (tab === "magic" ? " tabActive" : "")} onClick={() => setTab("magic")}>Magic link</button>
          </div>

          {tab === "password" && (
            <form onSubmit={onPassword} style={{ display: "grid", gap: 10 }}>
              <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
              <button className="btn btnPrimary full" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
              <div className="small" style={{ textAlign: "right" }}>
                <Link href="/forgot-password" className="muted">Forgot password?</Link>
              </div>
            </form>
          )}

          {tab === "magic" && (
            <form onSubmit={onMagic} style={{ display: "grid", gap: 10 }}>
              <input className="input" type="email" placeholder="Your email" value={magicEmail} onChange={e => setMagicEmail(e.target.value)} required />
              <button className="btn btnPrimary full" type="submit" disabled={loading}>
                {loading ? "Sending…" : "Send magic link"}
              </button>
            </form>
          )}

          {msg && (
            <div className={msg.ok ? "successBox" : "errorBox"} style={{ marginTop: 14 }}>
              <div className="small">{msg.text}</div>
            </div>
          )}

          <div className="hr" />
          <div className="small muted" style={{ textAlign: "center" }}>
            No account? <Link href="/signup"><b>Create one free</b></Link>
          </div>
        </div>
      </main>
    </>
  );
}
