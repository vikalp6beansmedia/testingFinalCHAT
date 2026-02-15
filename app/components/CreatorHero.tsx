"use client";

import { useEffect, useState } from "react";
import type { CreatorProfileDTO } from "@/lib/profile";

export default function CreatorHero() {
  const [profile, setProfile] = useState<CreatorProfileDTO>({
    displayName: "Preet Kohli Uncensored",
    tagline: "Exclusive drops • behind-the-scenes • member-only chat",
    avatarUrl: null,
    bannerUrl: null,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/profile", { cache: "no-store" });
        const j = await r.json();
        if (!alive) return;
        if (j?.profile) setProfile(j.profile);
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="container mobile-shell pagePad">
      <div className="card heroCard">
        <div
          className="banner"
          style={
            profile.bannerUrl
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.10), rgba(0,0,0,.55)), url(${profile.bannerUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className="bannerGlow" />
        </div>

        <div className="avatarWrap">
          <div className="avatar" aria-hidden={!profile.avatarUrl}>
            {profile.avatarUrl ? <img className="avatarImg" src={profile.avatarUrl} alt="Profile" /> : null}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="heroTitle">{profile.displayName}</div>
            <div className="small muted" style={{ marginTop: 6 }}>
              {profile.tagline}
            </div>

            <div className="tabRow" style={{ marginTop: 14 }}>
              <div className="tab tabActive">Posts</div>
              <div className="tab">About</div>
              <div className="tab">Perks</div>
            </div>
          </div>
        </div>

        <div className="heroMeta">
          <div className="chip">120+ paid members</div>
          <div className="chip">Online now</div>
          <div className="chip">New drops weekly</div>
        </div>

        <div style={{ marginTop: 16 }}>
          <a className="btn btnPrimary full" href="/membership">
            Unlock access
          </a>
        </div>

        <div className="small muted" style={{ marginTop: 10 }}>
          Subscribe to <b>Basic</b> / <b>Pro</b> to unlock posts + chat.
        </div>
      </div>
    </div>
  );
}
