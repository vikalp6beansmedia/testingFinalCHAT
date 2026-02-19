"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, notFound } from "next/navigation";
import Nav from "@/components/Nav";
import CreatorHero from "@/components/CreatorHero";
import FeedToolbar from "@/components/FeedToolbar";
import PostCard from "@/components/PostCard";
import { FeedSkeleton } from "@/components/Skeleton";
import type { PostDTO } from "@/lib/postTypes";

export default function CreatorPage() {
  const params = useParams();
  const username = (params?.username as string || "").toLowerCase();
  const { data: session, status } = useSession();
  const sessionReady = status !== "loading";
  const tier = sessionReady ? String((session as any)?.tier ?? "NONE").toUpperCase() : "LOADING";

  const [valid, setValid] = useState<boolean | null>(null); // null = loading
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [q, setQ] = useState("");

  // Verify username matches the creator's slug
  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        const profileUsername = (d?.profile?.username || "creator").toLowerCase();
        setValid(username === profileUsername);
      })
      .catch(() => setValid(false));
  }, [username]);

  // Fetch posts once session + username validity confirmed
  useEffect(() => {
    if (!sessionReady || valid !== true) return;
    let alive = true;
    setPostsLoading(true);
    fetch("/api/posts", { cache: "no-store" })
      .then(r => r.json())
      .then(json => { if (alive) setPosts(Array.isArray(json?.posts) ? json.posts : []); })
      .catch(() => { if (alive) setPosts([]); })
      .finally(() => { if (alive) setPostsLoading(false); });
    return () => { alive = false; };
  }, [sessionReady, valid]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter(p => (p.title + " " + p.excerpt).toLowerCase().includes(s));
  }, [posts, q]);

  // 404 if username doesn't match
  if (valid === false) return notFound();

  const showSkeleton = valid === null || !sessionReady || postsLoading;

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
                <div className="small muted" style={{ marginTop: 6 }}>Check back soon!</div>
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
          <a href="/" className="footerLink">CreatorFarm</a>
        </div>
      </footer>
    </>
  );
}
