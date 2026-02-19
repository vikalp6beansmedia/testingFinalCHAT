"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function AboutPage() {
  const [profile, setProfile] = useState<{ displayName: string; tagline: string }>({ displayName: "", tagline: "" });

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => { if (d?.profile) setProfile(d.profile); }).catch(() => {});
  }, []);

  return (
    <>
      <Nav />
      <main className="container pagePad" style={{ maxWidth: 680, paddingTop: 24 }}>
        <div className="card" style={{ padding: 32 }}>
          <div className="small muted" style={{ marginBottom: 6 }}><Link href="/">← Back to home</Link></div>
          <h1 style={{ marginTop: 8, fontSize: 28 }}>About {profile.displayName || "CreatorFarm"}</h1>
          <p className="muted" style={{ lineHeight: 1.8 }}>{profile.tagline || "Exclusive content, member drops, and direct creator chat."}</p>
          <div className="hr" />
          <h2 style={{ fontSize: 18 }}>What you get as a member</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              ["⭐ Exclusive posts", "Videos, images, and written content not available anywhere else."],
              ["💬 Direct chat", "Message the creator directly and get real replies."],
              ["🔥 Early access", "See new drops before anyone else."],
              ["🎁 Member perks", "Special Q&As, behind-the-scenes, and more."],
            ].map(([title, desc]) => (
              <div key={title} className="rowCard" style={{ alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{title}</div>
                  <div className="small muted" style={{ marginTop: 4 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="hr" />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/membership" className="btn btnPrimary">View plans</Link>
            <Link href="/" className="btn">See all posts</Link>
          </div>
        </div>
      </main>
    </>
  );
}
