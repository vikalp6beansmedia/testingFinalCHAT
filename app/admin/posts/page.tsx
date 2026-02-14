"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";

type PostRow = {
  id: string;
  title: string;
  access: string;
  type: string;
  createdAt: string;
};

export default function AdminPostsPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/posts", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setPosts(json.posts || []);
    } catch (e: any) {
      setErr(e?.message || "Failed");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Nav />
      <div className="container">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 950 }}>Posts Admin</div>
              <div className="muted" style={{ fontSize: 13 }}>
                Create / edit posts that appear on the Home feed.
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={load} disabled={loading}>
                Refresh
              </button>
              <Link className="btn btnPrimary" href="/admin/posts/new">
                + New post
              </Link>
            </div>
          </div>

          <div className="hr" />

          {err ? (
            <div className="muted">Error: {err}</div>
          ) : loading ? (
            <div className="muted">Loading…</div>
          ) : posts.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {posts.map((p) => (
                <Link key={p.id} href={`/admin/posts/${p.id}`} className="card" style={{ padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontWeight: 900 }}>{p.title}</div>
                    <div className="pill">
                      {String(p.access).toUpperCase()} • {String(p.type).toUpperCase()}
                    </div>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="muted">No posts yet. Create your first post.</div>
          )}
        </div>
      </div>
    </>
  );
}
