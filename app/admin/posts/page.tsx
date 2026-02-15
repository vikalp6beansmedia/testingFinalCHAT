"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "@/components/Nav";
import type { PostDTO, AccessType, PostType } from "@/lib/postTypes";

const ACCESS: AccessType[] = ["FREE", "BASIC", "PRO", "PAID"];
const TYPES: PostType[] = ["VIDEO", "IMAGE"];

export default function AdminPostsPage() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState<PostDTO[]>([]);

  const [profile, setProfile] = useState({
    displayName: "Preet Kohli Uncensored",
    tagline: "Exclusive drops • behind-the-scenes • member-only chat",
    avatarUrl: "",
    bannerUrl: "",
  });

  const [profileMsg, setProfileMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    type: "VIDEO" as PostType,
    access: "FREE" as AccessType,
    price: 0,
    mediaUrl: "",
    duration: "",
  });

  async function load() {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/admin/posts", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error || "Failed to load (are you admin?)");
      setLoading(false);
      return;
    }
    setPosts(Array.isArray(data?.posts) ? data.posts : []);
    setLoading(false);
  }

  async function loadProfile() {
    try {
      const r = await fetch("/api/admin/profile", { cache: "no-store" });
      const j = await r.json();
      if (r.ok && j?.profile) {
        setProfile({
          displayName: j.profile.displayName || "Preet Kohli Uncensored",
          tagline: j.profile.tagline || "Exclusive drops • behind-the-scenes • member-only chat",
          avatarUrl: j.profile.avatarUrl || "",
          bannerUrl: j.profile.bannerUrl || "",
        });
      }
    } catch {
      // ignore
    }
  }

  async function saveProfile() {
    setProfileMsg("");
    const r = await fetch("/api/admin/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: profile.displayName,
        tagline: profile.tagline,
        avatarUrl: profile.avatarUrl || null,
        bannerUrl: profile.bannerUrl || null,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setProfileMsg(j?.error || "Save failed");
      return;
    }
    setProfileMsg("Saved ✅");
    await loadProfile();
  }

  async function upload(kind: "avatar" | "banner", file: File) {
    setProfileMsg("");
    const fd = new FormData();
    fd.append("kind", kind);
    fd.append("file", file);
    const r = await fetch("/api/admin/profile/upload", { method: "POST", body: fd });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setProfileMsg(j?.error || "Upload failed");
      return;
    }
    setProfileMsg("Uploaded ✅");
    await loadProfile();
  }

  async function create() {
    setMsg("");
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price || 0),
        duration: form.duration || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error || "Create failed");
      return;
    }

    setMsg("Created ✅");
    setForm({
      title: "",
      excerpt: "",
      type: "VIDEO",
      access: "FREE",
      price: 0,
      mediaUrl: "",
      duration: "",
    });
    await load();
  }

  async function del(id: string) {
    if (!confirm("Delete this post?") ) return;
    setMsg("");
    const res = await fetch(`/api/admin/posts/${id}/delete`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error || "Delete failed");
      return;
    }
    setMsg("Deleted ✅");
    await load();
  }

  useEffect(() => {
    load();
    loadProfile();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter((p) => (p.title + " " + p.excerpt).toLowerCase().includes(s));
  }, [posts, q]);

  return (
    <>
      <Nav />
      <div className="container mobile-shell pagePad">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0 }}>Posts Admin</h1>
              <div className="small muted" style={{ marginTop: 6 }}>
                Add / edit / delete posts like Patreon. Members see locked blur until they subscribe.
              </div>
            </div>
            <a className="btn" href="/" style={{ height: 44, display: "inline-flex", alignItems: "center" }}>
              View feed
            </a>
          </div>

          <div className="hr" />

          {/* Creator Profile */}
          <div className="card" style={{ padding: 14, background: "rgba(255,255,255,.04)", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 900 }}>Creator Profile</div>
                <div className="small muted" style={{ marginTop: 6 }}>
                  Upload <b>avatar</b> + <b>banner</b> for the Home page.
                </div>
              </div>
              <button className="btn" onClick={saveProfile}>
                Save profile
              </button>
            </div>

            <div className="hr" style={{ margin: "14px 0" }} />

            <div className="grid2">
              <div style={{ display: "grid", gap: 10 }}>
                <input
                  className="input"
                  placeholder="Display name"
                  value={profile.displayName}
                  onChange={(e) => setProfile((s) => ({ ...s, displayName: e.target.value }))}
                />
                <input
                  className="input"
                  placeholder="Tagline"
                  value={profile.tagline}
                  onChange={(e) => setProfile((s) => ({ ...s, tagline: e.target.value }))}
                />

                <div className="row2">
                  <input
                    className="input"
                    placeholder="Avatar URL (optional)"
                    value={profile.avatarUrl}
                    onChange={(e) => setProfile((s) => ({ ...s, avatarUrl: e.target.value }))}
                  />
                  <input
                    className="input"
                    placeholder="Banner URL (optional)"
                    value={profile.bannerUrl}
                    onChange={(e) => setProfile((s) => ({ ...s, bannerUrl: e.target.value }))}
                  />
                </div>

                {profileMsg ? <div className="small muted">{profileMsg}</div> : null}
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div className="rowCard" style={{ alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div className="avatar" style={{ width: 58, height: 58, borderRadius: 18 }}>
                      {profile.avatarUrl ? <img className="avatarImg" src={profile.avatarUrl} alt="Avatar" /> : null}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900 }}>Avatar</div>
                      <div className="small muted">Square / face crop</div>
                    </div>
                  </div>
                  <label className="btn" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) upload("avatar", f);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>

                <div className="rowCard" style={{ alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div
                      style={{
                        width: 120,
                        height: 58,
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,.12)",
                        background: "rgba(0,0,0,.22)",
                        overflow: "hidden",
                      }}
                    >
                      {profile.bannerUrl ? (
                        <img src={profile.bannerUrl} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      ) : null}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900 }}>Banner</div>
                      <div className="small muted">Wide / landscape</div>
                    </div>
                  </div>
                  <label className="btn" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) upload("banner", f);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid2">
            <div className="card" style={{ padding: 14, background: "rgba(255,255,255,.04)" }}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Create new post</div>

              <div style={{ display: "grid", gap: 10 }}>
                <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
                <textarea className="input" placeholder="Excerpt (shows on feed)" rows={4} value={form.excerpt} onChange={(e) => setForm((s) => ({ ...s, excerpt: e.target.value }))} />

                <div className="row2">
                  <select className="input" value={form.type} onChange={(e) => setForm((s) => ({ ...s, type: e.target.value as PostType }))}>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <select className="input" value={form.access} onChange={(e) => setForm((s) => ({ ...s, access: e.target.value as AccessType }))}>
                    {ACCESS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                {form.access === "PAID" ? (
                  <input
                    className="input"
                    placeholder="Price (₹)"
                    value={String(form.price)}
                    onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value || 0) }))}
                  />
                ) : null}

                <input className="input" placeholder="Media URL (YouTube/Vimeo/Drive/S3)" value={form.mediaUrl} onChange={(e) => setForm((s) => ({ ...s, mediaUrl: e.target.value }))} />
                <input className="input" placeholder="Duration (optional) e.g. 02:18" value={form.duration} onChange={(e) => setForm((s) => ({ ...s, duration: e.target.value }))} />

                <button className="btn btnPrimary full" onClick={create}>
                  Create post
                </button>

                {msg ? <div className="small muted">{msg}</div> : null}
              </div>
            </div>

            <div className="card" style={{ padding: 14, background: "rgba(255,255,255,.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div style={{ fontWeight: 900 }}>All posts</div>
                <button className="btn" onClick={load}>
                  Refresh
                </button>
              </div>

              <div style={{ marginTop: 10 }}>
                <input className="input" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>

              {loading ? (
                <div className="small muted" style={{ marginTop: 12 }}>
                  Loading…
                </div>
              ) : filtered.length ? (
                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                  {filtered.map((p) => (
                    <div key={p.id} className="rowCard">
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                        <div className="small muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.excerpt}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                          <span className="chip">{p.type}</span>
                          <span className="chip">{p.access}</span>
                          {p.access === "PAID" ? <span className="chip">₹{p.price}</span> : null}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <a className="btn" href={`/admin/posts/${p.id}`}>Edit</a>
                        <button className="btn danger" onClick={() => del(p.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="small muted" style={{ marginTop: 12 }}>
                  No posts yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
