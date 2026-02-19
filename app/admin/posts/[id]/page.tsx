"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import MediaUploader from "@/components/MediaUploader";
import type { AccessType, PostDTO, PostType } from "@/lib/postTypes";


const ACCESS: AccessType[] = ["FREE", "BASIC", "PRO", "PAID"];
const TYPES: PostType[] = ["VIDEO", "IMAGE"];

export default function AdminEditPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = String((params as any)?.id || "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
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

    const res = await fetch(`/api/admin/posts/${id}`, { cache: "no-store" });
    const data = await res.json();

    if (!res.ok) {
      setMsg(data?.error || "Failed to load post");
      setLoading(false);
      return;
    }

    const p: PostDTO = data.post;
    setForm({
      title: p.title,
      excerpt: p.excerpt,
      type: p.type,
      access: p.access,
      price: p.price,
      mediaUrl: p.mediaUrl,
      duration: p.duration || "",
    });

    setLoading(false);
  }

  async function save() {
    setSaving(true);
    setMsg("");

    const res = await fetch(`/api/admin/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price || 0),
        duration: form.duration || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error || "Save failed");
      setSaving(false);
      return;
    }

    setMsg("Saved ✅");
    setSaving(false);
  }

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <Nav />
      <div className="container mobile-shell pagePad">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0 }}>Edit post</h1>
              <div className="small muted" style={{ marginTop: 6 }}>
                ID: <span className="mono">{id}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => router.push("/admin/posts")}>
                Back
              </button>
              <a className="btn" href="/" target="_blank" rel="noreferrer">
                View feed
              </a>
            </div>
          </div>

          <div className="hr" />

          {loading ? (
            <div className="small muted">Loading…</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
              <textarea className="input" placeholder="Excerpt" rows={4} value={form.excerpt} onChange={(e) => setForm((s) => ({ ...s, excerpt: e.target.value }))} />

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

              <MediaUploader
                label="Media URL"
                value={form.mediaUrl}
                onChange={(url) => setForm((s) => ({ ...s, mediaUrl: url }))}
              />
              <input className="input" placeholder="Duration (optional)" value={form.duration} onChange={(e) => setForm((s) => ({ ...s, duration: e.target.value }))} />

              <button className="btn btnPrimary full" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>

              {msg ? <div className="small muted">{msg}</div> : null}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
