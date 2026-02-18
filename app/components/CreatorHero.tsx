import { getCreatorProfile } from "@/lib/profile";

export default async function CreatorHero() {
  const profile = await getCreatorProfile();

  const displayName = profile.displayName || "";
  const tagline = profile.tagline || "";
  const avatarUrl = profile.avatarUrl;
  const bannerUrl = profile.bannerUrl;

  return (
    <div className="container mobile-shell pagePad">
      <div className="card heroCard">
        <div
          className="banner"
          style={
            bannerUrl
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.10), rgba(0,0,0,.55)), url(${bannerUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className="bannerGlow" />
        </div>

        <div className="avatarWrap">
          <div className="avatar" aria-hidden={!avatarUrl}>
            {avatarUrl ? <img className="avatarImg" src={avatarUrl} alt="Profile" /> : null}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="heroTitle">{displayName}</div>
            <div className="small muted" style={{ marginTop: 6 }}>
              {tagline}
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
