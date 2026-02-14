"use client";

export default function FeedToolbar({ onSearch }: { onSearch: (v: string) => void }) {
  return (
    <div className="container mobile-shell" style={{ marginTop: 16 }}>
      <div style={{ fontWeight: 950, fontSize: 18, marginBottom: 10 }}>Recent posts</div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div className="pill">Post type</div>
        <div className="pill">Access</div>
        <div className="pill">Newest</div>
      </div>

      <div style={{ marginTop: 10 }}>
        <input className="input" placeholder="Search posts" onChange={(e) => onSearch(e.target.value)} />
      </div>
    </div>
  );
}
