import Nav from "@/components/Nav";
import Link from "next/link";
import { getCreatorProfile } from "@/lib/profile";

export const metadata = { title: "About – CreatorFarm" };

export default async function AboutPage() {
  const profile = await getCreatorProfile();

  return (
    <>
      <Nav />
      <main className="container pagePad" style={{ maxWidth: 680, paddingTop: 24 }}>
        <div className="card" style={{ padding: 32 }}>
          <h1 style={{ marginTop: 0, fontSize: 28 }}>About {profile.displayName || "CreatorFarm"}</h1>
          <p className="muted" style={{ lineHeight: 1.8 }}>
            {profile.tagline || "Exclusive content, member drops, and direct creator chat."}
          </p>

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
      <footer className="siteFooter">
        <span className="small muted">© {new Date().getFullYear()} CreatorFarm</span>
        <div className="footerLinks">
          <Link href="/terms" className="footerLink">Terms</Link>
          <Link href="/privacy" className="footerLink">Privacy</Link>
        </div>
      </footer>
    </>
  );
}
