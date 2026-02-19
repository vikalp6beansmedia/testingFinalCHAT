import { getCreatorProfile } from "@/lib/profile";
import Link from "next/link";

export default async function CreatorHero() {
  const profile = await getCreatorProfile();
  const { displayName, tagline, avatarUrl, bannerUrl } = profile;

  return (
    <div className="container" style={{ marginTop: 16 }}>
      <div className="card heroCard">

        {/* Banner */}
        <div
          className="banner"
          style={bannerUrl ? {
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.55)), url(${bannerUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          } : undefined}
        >
          <div className="bannerGlow" />
        </div>

        {/* Avatar + name */}
        <div className="avatarWrap">
          <div className="avatar">
            {avatarUrl
              ? <img className="avatarImg" src={avatarUrl} alt={displayName || "Creator"} />
              : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,rgba(108,142,255,.5),rgba(60,80,200,.35))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "rgba(200,215,255,.95)" }}>
                  {(displayName || "C")[0].toUpperCase()}
                </div>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 8 }}>
            <div className="heroTitle">{displayName || "Creator"}</div>
            {tagline && <div className="small muted" style={{ marginTop: 4 }}>{tagline}</div>}
          </div>
        </div>

        <div className="heroBody">
          {/* Perks chips */}
          <div className="heroMeta">
            <span className="chip info">✦ Exclusive drops</span>
            <span className="chip info">💬 Member chat</span>
            <span className="chip info">🔥 New weekly</span>
          </div>

          {/* ── Primary CTAs — always visible ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
            <Link href="/membership" className="btn btnPrimary full" style={{ justifyContent: "center" }}>
              ⭐ Unlock access
            </Link>
            <Link href="/signup" className="btn full" style={{ justifyContent: "center" }}>
              Join free
            </Link>
          </div>

          {/* ── Secondary auth row ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
            <span className="small muted">Already a member?</span>
            <Link href="/signin" className="btn btnSm" style={{ minHeight: 32, padding: "6px 14px", fontSize: 13 }}>
              Sign in
            </Link>
          </div>

          <div className="small muted" style={{ marginTop: 10, textAlign: "center" }}>
            Subscribe to <b>Basic</b> or <b>Pro</b> to unlock all posts and chat.
          </div>
        </div>
      </div>
    </div>
  );
}
