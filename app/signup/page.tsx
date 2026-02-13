"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

      setMsg("Signup successful! Redirecting to sign in...");
      router.push("/signin");
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 480 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Create account</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #444" }}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #444" }}
        />

        <input
          placeholder="Password (min 6 chars)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #444" }}
        />

        <button
          disabled={loading}
          type="submit"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      <p style={{ marginTop: 16 }}>
        Already have an account? <a href="/signin">Sign in</a>
      </p>
    </main>
  );
}
