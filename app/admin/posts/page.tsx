// app/posts-admin/page.tsx
"use client";

import { useEffect, useState } from "react";

type CreatorProfile = {
  id: string;
  displayName: string;
  tagline: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
};

export default function PostsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // IMPORTANT: start empty (no Preet defaults)
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [bannerUrl, setBannerUrl] = useState<string>("");

  const [status, setStatus] = useState<string>("");

  async function loadProfile() {
    setLoading(true);
    setStatus("");
    const res = await fetch("/api/profile", { cache: "no-store" });
    const json = await res.json();

    const p: CreatorProfile | undefined = json?.profile;
    setDisplayName(p?.displayName ?? "");
    setTagline(p?.tagline ?? "");
    setAvatarUrl(p?.avatarUrl ?? "");
    setBannerUrl(p?.bannerUrl ?? "");

    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function saveProfile() {
    try {
      setSaving(true);
      setStatus("");

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          tagline,
          avatarUrl: avatarUrl || null,
          bannerUrl: bannerUrl || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus(`Save failed (${res.status}) ${err?.error ?? ""}`);
        return;
      }

      setStatus("Saved ✅");
      await loadProfile(); // re-sync
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Posts Admin</h1>

      <div style={{ marginTop: 18, padding: 18, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Creator Profile</div>
            <div style={{ opacity: 0.7, fontSize: 13 }}>Upload avatar + banner for the Home page.</div>
          </div>
          <button
            onClick={saveProfile}
            disabled={loading || saving}
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>

        {loading ? (
          <div style={{ marginTop: 18, opacity: 0.7 }}>Loading profile...</div>
        ) : (
          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)" }}
            />

            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Tagline"
              style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Avatar URL (optional)"
                style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)" }}
              />
              <input
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="Banner URL (optional)"
                style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>

            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>{status}</div>
          </div>
        )}
      </div>
    </div>
  );
}
