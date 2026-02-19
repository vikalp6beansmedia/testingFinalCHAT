"use client";

export function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: 18,
        background: "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.08)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,.07) 50%, transparent 100%)",
          animation: "shimmer 1.4s infinite",
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="container" style={{ marginTop: 12 }}>
      <div className="card" style={{ padding: 14, display: "grid", gap: 10 }}>
        <SkeletonCard height={18} />
        <SkeletonCard height={12} />
        <SkeletonCard height={12} />
        <SkeletonCard height={200} />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <>
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </>
  );
}
