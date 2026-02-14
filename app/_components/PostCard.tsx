"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/lib/postTypes";
import { canAccessPost } from "@/lib/postTypes";

function formatINR(n: number) {
  if (!n) return "Free";
  return "₹" + n.toString();
}

function niceDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function PostCard({ post, tier }: { post: Post; tier: string }) {
  const [open, setOpen] = useState(false);
  const locked = useMemo(() => !canAccessPost(post.access, tier), [post.access, tier]);

  return (
    <div className="container mobile-shell" style={{ marginTop: 12 }}>
      <div className="card" style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontWeight: 950, fontSize: 16 }}>{post.title}</div>
          <div className="chip">{niceDate(post.createdAt)}</div>
        </div>

        <div className="small muted" style={{ marginTop: 6 }}>
          {post.excerpt}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          <div className="chip">{post.type}</div>
          <div className="chip">{post.access === "PAID" ? `Paid • ${formatINR(post.price)}` : post.access}</div>
          {post.duration ? <div className="chip">{post.duration}</div> : null}
          {locked ? <div className="chip warn">Locked</div> : <div className="chip ok">Unlocked</div>}
        </div>

        <div style={{ marginTop: 12 }}>
          {locked ? (
            <button className="btn full" onClick={() => setOpen(true)}>
              Preview (locked)
            </button>
          ) : (
            <a className="btn primary full" href={post.mediaUrl} target="_blank" rel="noreferrer">
              Open media
            </a>
          )}
        </div>

        {open ? (
          <div className="modalBackdrop" onClick={() => setOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div style={{ fontWeight: 950, fontSize: 16 }}>Locked post</div>
              <div className="small muted" style={{ marginTop: 8 }}>
                This post requires <b>{post.access}</b> access.
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                <a className="btn primary full" href="/membership">
                  Subscribe to unlock
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
