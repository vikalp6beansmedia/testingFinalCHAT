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
    fetch("/api/profile").then(r => r.json()).then(d => { if (d?.profile) setProfile(d.profile); }).catch(() => {});
  }, []);

  const { displayName, tagline, avatarUrl, bannerUrl } = profile;

  return (
    <div className="heroWrapper">
      {/* ── Full-width banner ── */}
      <div className="heroBanner">
        {bannerUrl
          ? <img src={bannerUrl} alt="banner" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          : <div className="heroBannerDefault" />
        }
        <div className="heroBannerOverlay" />
      </div>

      {/* ── Profile card pulled up over banner ── */}
      <div className="container">
        <div className="heroProfileCard">

          {/* Avatar — centered, overlapping banner */}
          <div className="heroAvatarRing">
            <div className="heroAvatar">
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} />
                : <div className="heroAvatarFallback">{(displayName || "C")[0].toUpperCase()}</div>
              }
            </div>
          </div>

          {/* Name + tagline centered */}
          <div className="heroInfo">
            <h1 className="heroName">{displayName || "CreatorFarm"}</h1>
            {tagline && <p className="heroTagline">{tagline}</p>}

            {/* Stats row */}
            <div className="heroStats">
              <span className="heroStat"><span className="heroStatVal">✦</span> Exclusive drops</span>
              <span className="heroStatDot" />
              <span className="heroStat"><span className="heroStatVal">💬</span> Member chat</span>
              <span className="heroStatDot" />
              <span className="heroStat"><span className="heroStatVal">🔥</span> New weekly</span>
            </div>
          </div>

          {/* ── Session-aware CTA ── */}
          <div className="heroCTA">
            {sessionLoading ? (
              <div style={{ height: 48 }} />
            ) : isPaid ? (
              <div className="heroCTAPaid">
                <div className="heroPaidBadge">✓ {tier} member — posts unlocked below 👇</div>
                <div className="heroCTARow">
                  <Link href="/membership/chat" className="btn btnPrimary">💬 Open chat</Link>
                  <Link href="/membership" className="btn">Manage plan</Link>
                </div>
              </div>
            ) : isSignedIn ? (
              <div className="heroCTARow">
                <Link href="/membership" className="btn btnPrimary heroJoinBtn">⭐ Upgrade to unlock</Link>
              </div>
            ) : (
              <div className="heroCTARow">
                <Link href="/membership" className="btn btnPrimary heroJoinBtn">⭐ Become a member</Link>
                <Link href="/signup" className="btn heroSecondBtn">Join free</Link>
                <div className="heroSignInRow">
                  <span className="small muted">Already a member?</span>
                  <Link href="/signin" className="heroSignInLink">Sign in</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
