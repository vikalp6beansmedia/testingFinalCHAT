"use client";

import { useMemo, useState } from "react";
import type { PostDTO } from "@/lib/postTypes";
import { canAccessPost } from "@/lib/postTypes";

function niceDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function formatINR(n: number) {
  if (!n) return "Free";
  return "₹" + n.toString();
}

export default function PostCard({ post, tier }: { post: PostDTO; tier: string }) {
  const [open, setOpen] = useState(false);
  const locked = useMemo(() => !canAccessPost(post.access, tier), [post.access, tier]);

  return (
    <div className="container mobile-shell" style={{ marginTop: 12 }}>
      <div className="card" style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>{post.title}</div>
          <div className="chip">{niceDate(post.createdAt)}</div>
        </div>

        <div className={locked ? "blurText" : "small muted"} style={{ marginTop: 8 }}>
          {post.excerpt}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <div className="chip">{post.type}</div>
          <div className="chip">
            {post.access === "PAID" ? `Paid • ${formatINR(post.price)}` : post.access}
          </div>
          {post.duration ? <div className="chip">{post.duration}</div> : null}
          {locked ? <div className="chip warn">Locked</div> : <div className="chip ok">Unlocked</div>}
        </div>

        <div style={{ marginTop: 12 }}>
          {locked ? (
            <button className="btn full" onClick={() => setOpen(true)}>
              Preview (locked)
            </button>
          ) : (
            <a className="btn btnPrimary full" href={post.mediaUrl} target="_blank" rel="noreferrer">
              Open media
            </a>
          )}
        </div>

        {open ? (
          <div className="modalBackdrop" onClick={() => setOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Unlock this post</div>
              <div className="small muted" style={{ marginTop: 8 }}>
                This content requires <b>{post.access}</b> access.
              </div>
              <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                <a className="btn btnPrimary full" href="/membership">
                  Subscribe now
                </a>
                <button className="btn full" onClick={() => setOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
