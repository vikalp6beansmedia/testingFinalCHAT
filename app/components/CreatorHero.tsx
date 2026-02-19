"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Profile = { displayName: string; tagline: string; avatarUrl: string | null; bannerUrl: string | null };

export default function CreatorHero() {
  const { data: session, status } = useSession();
  const tier = (session as any)?.tier ?? "NONE";
  const isPaid = tier === "BASIC" || tier === "PRO";
  const isSignedIn = !!session;
  const sessionLoading = status === "loading";

  const [profile, setProfile] = useState<Profile>({ displayName: "", tagline: "", avatarUrl: null, bannerUrl: null });

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => { if (d?.profile) setProfile(d.profile); })
      .catch(() => {});
  }, []);

  const { displayName, tagline, avatarUrl, bannerUrl } = profile;

  return (
    <div className="container" style={{ marginTop: 16 }}>
      <div className="card heroCard">

        {/* Banner */}
        <div className="banner" style={bannerUrl ? {
          backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.55)),url(${bannerUrl})`,
          backgroundSize: "cover", backgroundPosition: "center",
        } : undefined}>
          <div className="bannerGlow" />
        </div>

        {/* Avatar + name */}
        <div className="avatarWrap">
          <div className="avatar">
            {avatarUrl
              ? <img className="avatarImg" src={avatarUrl} alt={displayName || "Creator"} />
              : <div style={{ width:"100%",height:"100%",background:"linear-gradient(135deg,rgba(108,142,255,.5),rgba(60,80,200,.35))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,color:"rgba(200,215,255,.95)" }}>
                  {(displayName || "C")[0].toUpperCase()}
                </div>
            }
          </div>
          <div style={{ flex:1, minWidth:0, paddingBottom:8 }}>
            <div className="heroTitle">{displayName || "CreatorFarm"}</div>
            {tagline && <div className="small muted" style={{ marginTop:4 }}>{tagline}</div>}
          </div>
        </div>

        <div className="heroBody">
          {/* Perks */}
          <div className="heroMeta">
            <span className="chip info">✦ Exclusive drops</span>
            <span className="chip info">💬 Member chat</span>
            <span className="chip info">🔥 New weekly</span>
          </div>

          {/* ── Session-aware CTA ── */}
          {sessionLoading ? (
            <div style={{ height: 90, marginTop: 18 }} />
          ) : isPaid ? (
            // PAID MEMBER
            <div style={{ marginTop: 18 }}>
              <div className="successBox" style={{ textAlign:"center", marginBottom:12, padding:"12px 16px" }}>
                <div style={{ fontWeight:700 }}>✓ You're on <b>{tier}</b> — your posts are unlocked below 👇</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <Link href="/membership/chat" className="btn btnPrimary full" style={{ justifyContent:"center" }}>
                  💬 Open chat
                </Link>
                <Link href="/membership" className="btn full" style={{ justifyContent:"center" }}>
                  Manage plan
                </Link>
              </div>
            </div>
          ) : isSignedIn ? (
            // SIGNED IN, FREE
            <div style={{ marginTop:18 }}>
              <div className="notice" style={{ textAlign:"center", marginBottom:12 }}>
                <div className="small muted">You're on the free plan — subscribe to unlock all posts and chat.</div>
              </div>
              <Link href="/membership" className="btn btnPrimary full" style={{ justifyContent:"center" }}>
                ⭐ Upgrade to unlock everything
              </Link>
            </div>
          ) : (
            // NOT SIGNED IN
            <div style={{ marginTop:18 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <Link href="/membership" className="btn btnPrimary full" style={{ justifyContent:"center" }}>
                  ⭐ Unlock access
                </Link>
                <Link href="/signup" className="btn full" style={{ justifyContent:"center" }}>
                  Join free
                </Link>
              </div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:12 }}>
                <span className="small muted">Already a member?</span>
                <Link href="/signin" className="btn btnSm" style={{ minHeight:32, padding:"6px 14px", fontSize:13 }}>
                  Sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
