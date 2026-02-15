"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";

export default function MembershipSuccessPage() {
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = "/";
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Nav />
      <div className="container mobile-shell pagePad" style={{ marginTop: 14 }}>
        <div className="card" style={{ padding: 18 }}>
          <h1 style={{ marginTop: 0 }}>Subscription successful ✅</h1>
          <div className="small muted" style={{ marginTop: 6 }}>
            Redirecting you back to home in <b>{seconds}s</b>…
          </div>

          <div className="notice" style={{ marginTop: 14 }}>
            <div className="small muted">
              If your tier doesn’t appear immediately, it will update within a few seconds (webhook confirms membership).
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button onClick={() => (window.location.href = "/")} className="btn btnPrimary">
              Go to Home now
            </button>
            <a href="/membership/chat" className="btn">
              Open Chat
            </a>
            <a href="/membership" className="btn">
              Membership page
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
