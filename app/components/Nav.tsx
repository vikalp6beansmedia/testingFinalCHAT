"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Nav() {
  const { data } = useSession();
  const tier = (data as any)?.tier ?? "NONE";
  const role = (data as any)?.role ?? "USER";
  const email = data?.user?.email ?? "";

  const hasChat = tier === "BASIC" || tier === "PRO";
  const isAdmin = role === "ADMIN";

  return (
    <div className="container">
      <div className="card nav">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,.12)",
              background: "rgba(0,0,0,.25)",
            }}
          />
          <div>
            <div style={{ fontWeight: 800 }}>CreatorFarm</div>
            <div className="muted" style={{ fontSize: 12 }}>
              {email || "Not signed in"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <Link className="pill" href="/">Home</Link>
          <Link className="pill" href="/membership">Membership</Link>

          {hasChat ? <Link className="pill" href="/membership/chat">Chat</Link> : null}
          {isAdmin ? <Link className="pill" href="/admin/chat">Admin Chat</Link> : null}

          <Link className="pill" href="/admin/settings">Admin</Link>
          <span className="pill">
            Tier: <b>{tier}</b>
          </span>

          {data ? (
            <button className="btn" onClick={() => signOut()}>
              Sign out
            </button>
          ) : (
            <button className="btn btnPrimary" onClick={() => signIn()}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
