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
    // Force refresh so navbar tier updates without "back back back"
    const t = setTimeout(() => {
      window.location.href = "/";
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl">
          <h1 className="text-3xl font-semibold text-white">Subscription successful ✅</h1>
          <p className="mt-2 text-white/70">
            Redirecting you back to home in {seconds}s…
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-white/80">
            <div className="text-sm">
              If your tier doesn’t appear immediately, it will update within a few seconds.
              (Webhook confirms membership.)
            </div>
          </div>

          <button
            onClick={() => (window.location.href = "/")}
            className="mt-6 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500"
          >
            Go to Home now
          </button>
        </div>
      </div>
    </div>
  );
}
