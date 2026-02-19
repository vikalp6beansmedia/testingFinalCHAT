"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.replace("/signin"); return; }
    const role = (session as any)?.role ?? "USER";
    if (role === "ADMIN" || role === "CREATOR") { router.replace("/admin/posts"); return; }
    fetch("/api/profile").then(r => r.json()).then(d => {
      router.replace(`/${d?.profile?.username || "creator"}`);
    }).catch(() => router.replace("/"));
  }, [session, status]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#04060f" }}>
      <div style={{ textAlign: "center", color: "rgba(255,255,255,.6)" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
        <div>Signing you in…</div>
      </div>
    </div>
  );
}
