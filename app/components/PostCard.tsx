"use client";

import { useMemo, useState } from "react";
import type { PostDTO } from "@/lib/postTypes";
import { canAccessPost } from "@/lib/postTypes";

function niceDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function MediaPreview({ post }: { post: PostDTO }) {
  const url = post.mediaUrl;
  const isVideo = post.type === "VIDEO" || /\.(mp4|webm|mov)$/i.test(url) || url.startsWith("data:video");
  const isImage = post.type === "IMAGE" || /\.(jpe?g|png|gif|webp)$/i.test(url) || url.startsWith("data:image");

  if (isVideo) {
    return (
      <video
        controls
        style={{ width: "100%", borderRadius: 12, maxHeight: 360, background: "#000" }}
        preload="metadata"
      >
        <source src={url} />
        Your browser does not support video.
      </video>
    );
  }
  if (isImage) {
    return <img src={url} alt={post.title} style={{ width: "100%", borderRadius: 12, maxHeight: 400, objectFit: "cover" }} />;
  }
  // fallback — external URL
  return (
    <a href={url} target="_blank" rel="noreferrer" className="btn btnPrimary full">
      Open media ↗
    </a>
  );
}

export default function PostCard({ post, tier }: { post: PostDTO; tier: string }) {
  const [open, setOpen] = useState(false);
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
          </div>
        </div>

        <div className="small muted" style={{ marginTop: 6 }}>{niceDate(post.createdAt)}</div>

        {/* Excerpt */}
        <div className={locked ? "blurText small" : "small muted"} style={{ marginTop: 10, lineHeight: 1.6 }}>
          {post.excerpt}
        </div>

        {/* Media */}
        <div style={{ marginTop: 14 }}>
          {locked ? (
            <div style={{ position: "relative" }}>
              <div style={{ height: 160, borderRadius: 12, background: "rgba(0,0,0,.25)", border: "1px solid rgba(255,255,255,.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ fontSize: 32 }}>🔒</div>
                <div className="small muted">Requires <b>{post.access}</b> membership</div>
                <button className="btn btnPrimary btnSm" onClick={() => setOpen(true)} style={{ marginTop: 4 }}>
                  Unlock this post
                </button>
              </div>
            </div>
          ) : (
            <MediaPreview post={post} />
          )}
        </div>

        {/* Locked modal */}
        {open && (
          <div className="modalBackdrop" onClick={() => setOpen(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 8 }}>🔒 Unlock this post</div>
              <div className="small muted" style={{ marginBottom: 16 }}>
                This content requires <b>{post.access}</b> access. Subscribe to unlock all {post.access} posts and more.
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <a className="btn btnPrimary full" href="/membership">View membership plans</a>
                <button className="btn full" onClick={() => setOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
