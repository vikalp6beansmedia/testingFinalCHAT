"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
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

      setMsg("Signup successful! Redirecting to sign in…");
      router.push("/signin");
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <div className="container mobile-shell pagePad" style={{ marginTop: 14 }}>
        <div className="card" style={{ padding: 18, maxWidth: 560, margin: "0 auto" }}>
          <h1 style={{ marginTop: 0 }}>Create account</h1>
          <div className="small muted">Password login (admin can also use credentials). Google / Magic link is in Sign in.</div>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 14 }}>
            <input className="input" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input" placeholder="Password (min 6 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <button disabled={loading} type="submit" className="btn btnPrimary full">
              {loading ? "Creating..." : "Sign up"}
            </button>
          </form>

          {msg ? <div className="notice" style={{ marginTop: 12 }}><div className="small">{msg}</div></div> : null}

          <div className="small muted" style={{ marginTop: 14 }}>
            Already have an account? <a href="/signin"><b>Sign in</b></a>
          </div>
        </div>
      </div>
    </>
  );
}
