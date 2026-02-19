"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import MediaUploader from "@/components/MediaUploader";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  type: string;
  access: string;
  price: number;
  mediaUrl: string;
  duration: string | null;
  createdAt: string;
};

const ACCESS_OPTS = ["FREE", "BASIC", "PRO", "PAID"];
const TYPE_OPTS = ["VIDEO", "IMAGE"];

const EMPTY_FORM = { title: "", excerpt: "", type: "VIDEO", access: "FREE", price: 0, mediaUrl: "", duration: "" };

export default function PostsAdminPage() {
  const router = useRouter();

  // ── Profile ──────────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // ── Posts list ───────────────────────────────────────────
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // ── Create form ──────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // ── Delete ───────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Load ─────────────────────────────────────────────────
  async function loadProfile() {
    const res = await fetch("/api/profile", { cache: "no-store" });
    const json = await res.json();
    const p = json?.profile;
    setUsername(p?.username ?? "");
    setDisplayName(p?.displayName ?? "");
    setTagline(p?.tagline ?? "");
    setAvatarUrl(p?.avatarUrl ?? "");
    setBannerUrl(p?.bannerUrl ?? "");
  }

  async function loadPosts() {
    setPostsLoading(true);
    const res = await fetch("/api/admin/posts", { cache: "no-store" });
    const json = await res.json();
    setPosts(Array.isArray(json?.posts) ? json.posts : []);
    setPostsLoading(false);
  }

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, []);

  // ── Profile save ─────────────────────────────────────────
  async function saveProfile() {
    setProfileSaving(true);
    setProfileStatus("");
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, tagline, avatarUrl: avatarUrl || null, bannerUrl: bannerUrl || null }),
    });
    setProfileStatus(res.ok ? "Saved ✓" : "Save failed");
    setProfileSaving(false);
  }

  // ── Create post ──────────────────────────────────────────
  async function createPost() {
    if (!form.title.trim() || !form.excerpt.trim() || !form.mediaUrl.trim()) {
      setCreateMsg({ text: "Title, excerpt and media URL are required.", ok: false });
      return;
    }
    setCreating(true);
    setCreateMsg(null);
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price || 0), duration: form.duration || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCreateMsg({ text: data?.error || "Failed to create post.", ok: false });
      setCreating(false);
      return;
    }
    setCreateMsg({ text: "Post created ✓", ok: true });
    setForm({ ...EMPTY_FORM });
    setShowCreate(false);
    await loadPosts();
    setCreating(false);
  }

  // ── Delete post ──────────────────────────────────────────
  async function deletePost(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeletingId(id);
    await fetch(`/api/admin/posts/${id}/delete`, { method: "DELETE" });
    await loadPosts();
    setDeletingId(null);
  }

  function niceDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <>
      <Nav />
      <main className="container pagePad" style={{ paddingTop: 24 }}>

        {/* ── Creator Profile ── */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Creator Profile</div>
              <div className="small muted">Name, tagline, avatar and banner shown on the home page.</div>
            </div>
            <button className="btn btnPrimary btnSm" onClick={saveProfile} disabled={profileSaving}>
              {profileSaving ? "Saving…" : "Save profile"}
            </button>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div className="small muted" style={{ marginBottom: 6 }}>Your page URL: <b>creatorfarm.in/<span style={{color:"var(--accent)"}}>{username || "creator"}</span></b></div>
              <input className="input" placeholder="Your URL slug (e.g. honeykohli)" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))} />
            </div>
            <input className="input" placeholder="Display name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            <input className="input" placeholder="Tagline (shown under your name)" value={tagline} onChange={e => setTagline(e.target.value)} />
            <div className="row2">
              <input className="input" placeholder="Avatar URL (paste or upload below)" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} />
              <input className="input" placeholder="Banner URL (paste or upload below)" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} />
            </div>
            {(avatarUrl || bannerUrl) && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
                {avatarUrl && <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}><div className="small muted">Avatar preview</div><img src={avatarUrl} alt="avatar" style={{ width: 60, height: 60, borderRadius: 14, objectFit: "cover", border: "1px solid rgba(255,255,255,.15)" }} /></div>}
                {bannerUrl && <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}><div className="small muted">Banner preview</div><img src={bannerUrl} alt="banner" style={{ height: 60, width: 200, borderRadius: 10, objectFit: "cover", border: "1px solid rgba(255,255,255,.15)" }} /></div>}
              </div>
            )}
            {profileStatus && <div className={profileStatus.includes("failed") ? "errorBox" : "successBox"} style={{ padding: "8px 12px" }}><div className="small">{profileStatus}</div></div>}
          </div>
        </div>

        {/* ── Posts header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 22 }}>
            Posts <span className="small muted" style={{ fontWeight: 500 }}>({posts.length})</span>
          </div>
          <button className="btn btnPrimary" onClick={() => { setShowCreate(v => !v); setCreateMsg(null); }}>
            {showCreate ? "✕ Cancel" : "+ New post"}
          </button>
        </div>

        {/* ── Create form ── */}
        {showCreate && (
          <div className="card" style={{ padding: 20, marginBottom: 16, border: "1px solid rgba(108,142,255,.35)" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>✨ Create new post</div>
            <div style={{ display: "grid", gap: 12 }}>
              <input className="input" placeholder="Post title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="input" placeholder="Excerpt / description *" rows={3} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
              <div className="row2">
                <div>
                  <div className="small muted" style={{ marginBottom: 6 }}>Content type</div>
                  <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {TYPE_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <div className="small muted" style={{ marginBottom: 6 }}>Access level</div>
                  <select className="input" value={form.access} onChange={e => setForm(f => ({ ...f, access: e.target.value }))}>
                    {ACCESS_OPTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              {form.access === "PAID" && (
                <input className="input" type="number" placeholder="Price in ₹" value={form.price || ""} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
              )}
              <input className="input" placeholder="Duration (optional, e.g. 12:34)" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              <MediaUploader
                label="Media (video/image) *"
                value={form.mediaUrl}
                onChange={url => setForm(f => ({ ...f, mediaUrl: url }))}
              />
              <button className="btn btnPrimary full" onClick={createPost} disabled={creating}>
                {creating ? "Creating…" : "Publish post"}
              </button>
              {createMsg && (
                <div className={createMsg.ok ? "successBox" : "errorBox"} style={{ padding: "8px 12px" }}>
                  <div className="small">{createMsg.text}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Posts list ── */}
        {postsLoading ? (
          <div className="card" style={{ padding: 20 }}>
            <div className="small muted">Loading posts…</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>No posts yet</div>
            <div className="small muted">Click "+ New post" above to publish your first post.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {posts.map(post => (
              <div key={post.id} className="card adminRow" style={{ padding: "14px 16px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{post.title}</div>
                  <div className="small muted" style={{ marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.excerpt}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className="chip">{post.type}</span>
                    <span className={"chip" + (post.access === "FREE" ? " ok" : post.access === "PAID" ? " warn" : " info")}>
                      {post.access}{post.access === "PAID" ? ` · ₹${post.price}` : ""}
                    </span>
                    {post.duration && <span className="chip">{post.duration}</span>}
                    <span className="chip">{niceDate(post.createdAt)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button className="btn btnSm" onClick={() => router.push(`/admin/posts/${post.id}`)}>Edit</button>
                  <button
                    className="btn btnSm btnDanger"
                    onClick={() => deletePost(post.id)}
                    disabled={deletingId === post.id}
                  >
                    {deletingId === post.id ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
