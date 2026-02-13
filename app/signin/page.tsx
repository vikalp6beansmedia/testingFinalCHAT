"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Nav from "@/components/Nav";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function onCreds() {
    setMsg("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });
    if ((res as any)?.error) setMsg("Login failed");
  }

  async function onGoogle() {
    setMsg("");
    await signIn("google", { callbackUrl: "/" });
  }

  async function onMagicLink() {
    setMsg("");
    if (!magicEmail.trim()) {
      setMsg("Enter your email for magic link");
      return;
    }
    const res = await signIn("email", { email: magicEmail.trim(), redirect: false });
    if ((res as any)?.error) setMsg("Magic link failed");
    else setMsg("Magic link sent (check your inbox)");
  }

  return (
    <>
      <Nav />
      <div className="container">
        <div className="card" style={{ padding: 24 }}>
          <h1 style={{ marginTop: 0 }}>Sign in</h1>
          <p className="muted">Google / Magic link / Password login supported.</p>

          <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
            <button className="btn btnPrimary" onClick={onGoogle}>
              Continue with Google
            </button>

            <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "8px 0" }} />

            <div style={{ display: "grid", gap: 10 }}>
              <input
                className="input"
                placeholder="Email for magic link"
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
              />
              <button className="btn" onClick={onMagicLink}>
                Send magic link
              </button>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "8px 0" }} />

            <div style={{ display: "grid", gap: 10 }}>
              <input
                className="input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="input"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="btn btnPrimary" onClick={onCreds}>
                Sign in (password)
              </button>
            </div>

            {msg ? <div className="muted">{msg}</div> : null}
          </div>
        </div>
      </div>
    </>
  );
}
