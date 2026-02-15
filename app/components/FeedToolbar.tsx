"use client";

export default function FeedToolbar({ onSearch }: { onSearch: (v: string) => void }) {
  return (
    <div className="container mobile-shell" style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontWeight: 950, fontSize: 18 }}>Recent posts</div>
        <div className="pill">Sorted: Newest</div>
      </div>

      <div className="tabRow" style={{ marginTop: 10 }}>
        <div className="tab tabActive">All</div>
        <div className="tab">Videos</div>
        <div className="tab">Images</div>
        <div className="tab">Locked</div>
      </div>

      <div style={{ marginTop: 10 }}>
        <input className="input" placeholder="Search posts" onChange={(e) => onSearch(e.target.value)} />
      </div>
    </div>
  );
}
