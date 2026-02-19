"use client";

import { useMemo, useState } from "react";
import type { PostDTO } from "@/lib/postTypes";
import { canAccessPost } from "@/lib/postTypes";

function niceDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

// ── URL helpers ──────────────────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

function getGoogleDriveEmbedUrl(url: string): string | null {
  // Handles: /file/d/FILE_ID/view, /file/d/FILE_ID/edit, open?id=FILE_ID
  const m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
            url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  // Already an embed link
  if (url.includes("drive.google.com") && url.includes("/preview")) return url;
  return null;
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url) || url.startsWith("data:video");
}

function isDirectImage(url: string) {
  return /\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i.test(url) || url.startsWith("data:image");
}

// ── Thumbnail extractor (for blur preview) ───────────────────────────────────

function getThumbnailUrl(post: PostDTO): string | null {
  const url = post.mediaUrl;
  if (!url) return null;
  const ytId = getYouTubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  if (isDirectImage(url)) return url;
  // For direct video or Vimeo we can't easily get a thumbnail without server — return null
  return null;
}

// ── Media player (unlocked) ───────────────────────────────────────────────────

function MediaPlayer({ post }: { post: PostDTO }) {
  const url = post.mediaUrl;
  const ytId = getYouTubeId(url);
  const vimeoId = getVimeoId(url);

  if (ytId) {
    return (
      <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", background: "#000" }}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
        />
      </div>
    );
  }

  if (vimeoId) {
    return (
      <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", background: "#000" }}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?byline=0&portrait=0`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
        />
      </div>
    );
  }

  const driveEmbedUrl = getGoogleDriveEmbedUrl(url);
  if (driveEmbedUrl) {
    return (
      <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", background: "#000" }}>
        <iframe
          src={driveEmbedUrl}
          allow="autoplay"
          allowFullScreen
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
        />
      </div>
    );
  }

  if (isDirectVideo(url)) {
    return (
      <video
        controls
        style={{ width: "100%", borderRadius: 12, maxHeight: 400, background: "#000", display: "block" }}
        preload="metadata"
      >
        <source src={url} />
      </video>
    );
  }

  if (isDirectImage(url)) {
    return (
      <img
        src={url}
        alt={post.title}
        style={{ width: "100%", borderRadius: 12, maxHeight: 420, objectFit: "cover", display: "block" }}
      />
    );
  }

  // Unknown URL — open externally
  return (
    <a href={url} target="_blank" rel="noreferrer" className="btn btnPrimary full">
      Open media ↗
    </a>
  );
}

// ── Locked preview with blurred thumbnail ─────────────────────────────────────

function LockedPreview({ post, onUnlock }: { post: PostDTO; onUnlock: () => void }) {
  const thumb = getThumbnailUrl(post);
  const isVid = post.type === "VIDEO" || getYouTubeId(post.mediaUrl) || getVimeoId(post.mediaUrl) || getGoogleDriveEmbedUrl(post.mediaUrl) || isDirectVideo(post.mediaUrl);

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        minHeight: 180,
        background: "rgba(0,0,0,.35)",
        cursor: "pointer",
      }}
      onClick={onUnlock}
    >
      {/* Blurred thumbnail background */}
      {thumb && (
        <img
          src={thumb}
          alt=""
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            filter: "blur(12px) brightness(0.45)",
            transform: "scale(1.08)", // hide blur edges
          }}
        />
      )}
      {!thumb && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg,rgba(30,40,80,.8),rgba(10,15,30,.9))",
        }} />
      )}

      {/* Lock overlay content */}
      <div style={{
        position: "relative",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: 180, gap: 10, padding: 20,
        textAlign: "center",
      }}>
        {/* Play/image icon */}
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(255,255,255,.15)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>
          {isVid ? "▶" : "🔒"}
        </div>
        <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>
          {post.access === "FREE" ? "Sign in to watch" : `${post.access} members only`}
        </div>
        <button
          className="btn btnPrimary btnSm"
          onClick={e => { e.stopPropagation(); onUnlock(); }}
          style={{ marginTop: 4 }}
        >
          Unlock this {isVid ? "video" : "post"}
        </button>
      </div>
    </div>
  );
}

// ── Main PostCard ─────────────────────────────────────────────────────────────

export default function PostCard({ post, tier }: { post: PostDTO; tier: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const locked = useMemo(() => !canAccessPost(post.access, tier), [post.access, tier]);

  return (
    <div className="container postCard">
      <div className="card" style={{ padding: 16 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 900, fontSize: 17, lineHeight: 1.3, flex: 1 }}>{post.title}</div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
            <span className="chip">{post.type}</span>
            <span className={"chip" + (post.access === "FREE" ? " ok" : " warn")}>
              {post.access === "FREE" ? "Free" : post.access === "PAID" ? `₹${post.price}` : post.access}
            </span>
            {post.duration && <span className="chip">{post.duration}</span>}
            {locked && <span className="chip warn">🔒 Locked</span>}
          </div>
        </div>

        <div className="small muted" style={{ marginTop: 5 }}>{niceDate(post.createdAt)}</div>

        {/* Excerpt — blurred when locked */}
        <div
          className="small"
          style={{
            marginTop: 8, lineHeight: 1.65,
            color: locked ? "transparent" : "rgba(255,255,255,.65)",
            textShadow: locked ? "0 0 8px rgba(255,255,255,.5)" : "none",
            userSelect: locked ? "none" : "auto",
          }}
        >
          {post.excerpt}
        </div>

        {/* Media area */}
        <div style={{ marginTop: 14 }}>
          {locked
            ? <LockedPreview post={post} onUnlock={() => setModalOpen(true)} />
            : <MediaPlayer post={post} />
          }
        </div>
      </div>

      {/* Unlock modal */}
      {modalOpen && (
        <div className="modalBackdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 8 }}>🔒 Unlock this post</div>
            <div className="small muted" style={{ marginBottom: 16 }}>
              This content requires <b>{post.access}</b> access.
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <a className="btn btnPrimary full" href="/membership">View membership plans</a>
              <button className="btn full" onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
