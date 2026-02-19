"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Signup failed");
      setMsg({ text: "Account created! Redirecting to sign in…", ok: true });
      setTimeout(() => router.push("/signin"), 1200);
    } catch (err: any) {
      setMsg({ text: err.message, ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="container pagePad" style={{ maxWidth: 480, paddingTop: 32 }}>
        <div className="card" style={{ padding: 28 }}>
          <h1 style={{ marginTop: 0, fontSize: 24 }}>Create account</h1>
          <p className="small muted" style={{ marginTop: -8, marginBottom: 20 }}>
            Free to join. Subscribe for exclusive content.
          </p>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            <input className="input" placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
            <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            <input className="input" type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />

            <button className="btn btnPrimary full" type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>

          {msg && (
            <div className={msg.ok ? "successBox" : "errorBox"} style={{ marginTop: 14 }}>
              <div className="small">{msg.text}</div>
            </div>
          )}

          <div className="hr" />
          <div className="small muted" style={{ textAlign: "center" }}>
            Already have an account? <Link href="/signin"><b>Sign in</b></Link>
          </div>
          <div className="small muted" style={{ textAlign: "center", marginTop: 10 }}>
            By joining you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
          </div>
        </div>
      </main>
    </>
  );
}
