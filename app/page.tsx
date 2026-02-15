"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Nav from "@/components/Nav";
import CreatorHero from "@/components/CreatorHero";
import FeedToolbar from "@/components/FeedToolbar";
import PostCard from "@/components/PostCard";
import type { PostDTO } from "@/lib/postTypes";

export default function Home() {
  const { data } = useSession();
  const tier = String((data as any)?.tier ?? "NONE").toUpperCase();

  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/posts", { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        setPosts(Array.isArray(json?.posts) ? json.posts : []);
      } catch {
        if (!alive) return;
        setPosts([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter((p) => (p.title + " " + p.excerpt).toLowerCase().includes(s));
  }, [posts, q]);

  return (
    <>
      <Nav />
      <CreatorHero />
      <FeedToolbar onSearch={setQ} />

      {loading ? (
        <div className="container mobile-shell" style={{ marginTop: 12 }}>
          <div className="card" style={{ padding: 14 }}>
            <div className="small muted">Loading posts…</div>
          </div>
        </div>
      ) : filtered.length ? (
        filtered.map((p) => <PostCard key={p.id} post={p} tier={tier} />)
      ) : (
        <div className="container mobile-shell" style={{ marginTop: 12, paddingBottom: 24 }}>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 900 }}>No posts yet</div>
            <div className="small muted" style={{ marginTop: 6 }}>
              Admin can add posts from <b>Posts Admin</b>.
            </div>
          </div>
        </div>
      )}

      <div className="container mobile-shell pagePad" style={{ marginTop: 14 }}>
        <div className="small muted" style={{ textAlign: "center" }}>
          © CreatorFarm • Patreon-style feed (Phase6 MASTER + Posts)
        </div>
      </div>
    </>
  );
}
