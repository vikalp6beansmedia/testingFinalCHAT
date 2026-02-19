"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Nav from "@/components/Nav";
import CreatorHero from "@/components/CreatorHero";
import FeedToolbar from "@/components/FeedToolbar";
import PostCard from "@/components/PostCard";
import { FeedSkeleton } from "@/components/Skeleton";
import type { PostDTO } from "@/lib/postTypes";

export default function Home() {
  const { data: session, status } = useSession();
  // Wait for session before deciding locked/unlocked state
  const sessionReady = status !== "loading";
  const tier = sessionReady ? String((session as any)?.tier ?? "NONE").toUpperCase() : "LOADING";

  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!sessionReady) return; // wait for session first
    let alive = true;
    setPostsLoading(true);
    fetch("/api/posts", { cache: "no-store" })
      .then(r => r.json())
      .then(json => { if (alive) setPosts(Array.isArray(json?.posts) ? json.posts : []); })
      .catch(() => { if (alive) setPosts([]); })
      .finally(() => { if (alive) setPostsLoading(false); });
    return () => { alive = false; };
  }, [sessionReady]); // re-run only once session is resolved

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter(p => (p.title + " " + p.excerpt).toLowerCase().includes(s));
  }, [posts, q]);

  const showSkeleton = !sessionReady || postsLoading;

  return (
    <>
      <Nav />
      <main>
        <CreatorHero />
        <FeedToolbar onSearch={setQ} />

        <div style={{ marginTop: 8, paddingBottom: 96 }}>
          {showSkeleton ? (
            <FeedSkeleton />
          ) : filtered.length ? (
            filtered.map(p => <PostCard key={p.id} post={p} tier={tier} />)
          ) : (
            <div className="container" style={{ marginTop: 12 }}>
              <div className="card" style={{ padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>No posts yet</div>
                <div className="small muted" style={{ marginTop: 6 }}>The creator hasn't posted anything yet. Check back soon!</div>
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
    </>
  );
}
