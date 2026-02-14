"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "@/app/components/Nav";
import type { PostDTO, AccessType, PostType } from "@/lib/postTypes";

const ACCESS: AccessType[] = ["FREE", "BASIC", "PRO", "PAID"];
const TYPES: PostType[] = ["VIDEO", "IMAGE"];

export default function AdminPostsPage() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState<PostDTO[]>([]);

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
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter((p) => (p.title + " " + p.excerpt).toLowerCase().includes(s));
  }, [posts, q]);

  return (
    <>
      <Nav />
      <div className="container mobile-shell">
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
