"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Nav from "@/components/Nav";
import CreatorHero from "@/components/CreatorHero";
import FeedToolbar from "@/components/FeedToolbar";
import PostCard from "@/components/PostCard";
import { FeedSkeleton } from "@/components/Skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter((p) => (p.title + " " + p.excerpt).toLowerCase().includes(s));
  }, [posts, q]);

  return (
    <ErrorBoundary>
      <Nav />
      <main>
        <CreatorHero />
        <FeedToolbar onSearch={setQ} />

        <div style={{ marginTop: 8 }}>
          {loading ? (
            <FeedSkeleton />
          ) : filtered.length ? (
            filtered.map((p) => <PostCard key={p.id} post={p} tier={tier} />)
          ) : (
            <div className="container" style={{ marginTop: 12 }}>
              <div className="card" style={{ padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>No posts yet</div>
                <div className="small muted" style={{ marginTop: 6 }}>
                  The creator hasn't posted anything yet. Check back soon!
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="siteFooter">
        <span className="small muted">© {new Date().getFullYear()} CreatorFarm</span>
        <div className="footerLinks">
          <a href="/terms" className="footerLink">Terms</a>
          <a href="/privacy" className="footerLink">Privacy</a>
          <a href="/signin" className="footerLink">Sign in</a>
          <a href="/signup" className="footerLink">Join</a>
        </div>
      </footer>
    </ErrorBoundary>
  );
}
