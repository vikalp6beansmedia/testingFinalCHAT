export default function CreatorHero() {
  return (
    <div className="container mobile-shell">
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background:
                "linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.04))",
              border: "1px solid rgba(255,255,255,.10)",
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>Preet Kohli Uncensored</div>
            <div className="small muted">Exclusive drops • behind-the-scenes • member-only chat</div>

            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <div className="chip">120+ paid members</div>
              <div className="chip">Online now</div>
              <div className="chip">New drops weekly</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
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
