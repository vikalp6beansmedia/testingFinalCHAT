"use client";

export default function FeedToolbar({ onSearch }: { onSearch: (v: string) => void }) {
  return (
    <div className="feedToolbar" style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Posts</div>
      </div>
      <div style={{ marginTop: 10 }}>
        <input
          className="input"
          placeholder="🔍  Search posts…"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
