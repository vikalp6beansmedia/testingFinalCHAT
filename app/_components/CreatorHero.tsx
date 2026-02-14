export default function CreatorHero() {
  return (
    <div className="container mobile-shell">
      <div className="card" style={{ padding: 14 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: 16,
              background: "linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.04))",
              border: "1px solid rgba(255,255,255,.10)",
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 950 }}>Preet Kohli Uncensored</div>
            <div className="small">Exclusive drops • behind-the-scenes • private chat for members</div>

            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <div className="chip">120+ paid members</div>
              <div className="chip">Online now</div>
              <div className="chip">New post every week</div>
            </div>
          </div>
        </div>

        <div className="ctaRow" style={{ marginTop: 12 }}>
          <a className="btn primary full" href="/membership">
            Unlock access
          </a>
        </div>

        <div className="small muted" style={{ marginTop: 10 }}>
          Tip: Subscribe to Basic/Pro to unlock member-only posts + chat.
        </div>
      </div>
    </div>
  );
}
