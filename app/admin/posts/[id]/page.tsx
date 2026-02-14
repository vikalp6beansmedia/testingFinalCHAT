"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Nav from "@/components/Nav";

type PostForm = {
  title: string;
  excerpt: string;
  type: "VIDEO" | "IMAGE";
  access: "FREE" | "BASIC" | "PRO" | "PAID";
  price: number;
  mediaUrl: string;
  duration: string;
};

const empty: PostForm = {
  title: "",
  excerpt: "",
  type: "VIDEO",
  access: "FREE",
  price: 0,
  mediaUrl: "",
  duration: "",
};

export default function AdminPostEditPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const isNew = id === "new";
  const router = useRouter();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(empty);

  useEffect(() => {
    if (isNew) return;

    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/admin/posts/${id}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed");
        if (!alive) return;
        const p = json.post;
        setForm({
          title: p.title || "",
          excerpt: p.excerpt || "",
          type: (String(p.type || "VIDEO").toUpperCase() as any) || "VIDEO",
          access: (String(p.access || "FREE").toUpperCase() as any) || "FREE",
          price: Number(p.price || 0),
          mediaUrl: p.mediaUrl || "",
          duration: p.duration || "",
        });
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, isNew]);

  const showPrice = useMemo(() => form.access === "PAID", [form.access]);

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const payload = {
        ...form,
        price: showPrice ? Number(form.price || 0) : 0,
        duration: form.duration?.trim() ? form.duration.trim() : null,
      };

      if (isNew) {
        const res = await fetch(`/api/admin/posts`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed");
        router.replace(`/admin/posts/${json.post.id}`);
      } else {
        const res = await fetch(`/api/admin/posts/${id}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed");
      }
      alert("Saved");
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    if (isNew) return;
    if (!confirm("Delete this post?")) return;

    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/posts/${id}/delete`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      router.push("/admin/posts");
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Nav />
      <div className="container">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 950 }}>{isNew ? "New Post" : "Edit Post"}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                This controls what appears on the Home feed.
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {!isNew ? (
                <button className="btn" onClick={del} disabled={saving}>
                  Delete
                </button>
              ) : null}
              <button className="btn btnPrimary" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>

          <div className="hr" />

          {err ? <div className="muted">Error: {err}</div> : null}
          {loading ? (
            <div className="muted">Loading…</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                  Title
                </div>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              <div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                  Excerpt
                </div>
                <textarea
                  className="input"
                  style={{ minHeight: 90, paddingTop: 10 }}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                    Type
                  </div>
                  <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
                    <option value="VIDEO">VIDEO</option>
                    <option value="IMAGE">IMAGE</option>
                  </select>
                </div>

                <div>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                    Access
                  </div>
                  <select className="input" value={form.access} onChange={(e) => setForm({ ...form, access: e.target.value as any })}>
                    <option value="FREE">FREE</option>
                    <option value="BASIC">BASIC</option>
                    <option value="PRO">PRO</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>
              </div>

              {showPrice ? (
                <div>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                    Price (INR)
                  </div>
                  <input
                    className="input"
                    inputMode="numeric"
                    value={String(form.price)}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value || 0) })}
                  />
                </div>
              ) : null}

              <div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                  Media URL (video/image)
                </div>
                <input className="input" value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} />
              </div>

              <div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                  Duration (optional, e.g. 08:40)
                </div>
                <input className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
