"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const LAST_SEEN_KEY = "cf_chat_last_seen_admin_at";

function parseIso(s: string | null | undefined) {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

function Icon({ name }: { name: string }) {
  const p = { className: "navIcon", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "home": return <svg viewBox="0 0 24 24" {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>;
    case "member": return <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>;
    case "chat": return <svg viewBox="0 0 24 24" {...p}><path d="M21 15a4 4 0 0 1-4 4H9l-4 3v-3H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 10h8M8 14h5"/></svg>;
    case "posts": return <svg viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>;
    case "signin": return <svg viewBox="0 0 24 24" {...p}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
    case "settings": return <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    default: return null;
  }
}

export default function Nav() {
  const { data, status } = useSession();
  const tier = (data as any)?.tier ?? "NONE";
  const role = (data as any)?.role ?? "USER";
  const email = data?.user?.email ?? "";
  const isLoaded = status !== "loading";
  const hasChat = tier === "BASIC" || tier === "PRO";
  const isAdmin = role === "ADMIN";
  const isSignedIn = !!data;
  const pathname = usePathname() || "/";
  const [hasUnread, setHasUnread] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function refreshUnread() {
    if (!data || !hasChat) { setHasUnread(false); return; }
    try {
      const r = await fetch("/api/chat/unread", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      const latest = parseIso(j?.latestAdminAt ?? null);
      if (!latest) { setHasUnread(false); return; }
      const seen = parseIso(typeof window !== "undefined" ? window.localStorage.getItem(LAST_SEEN_KEY) : null) ?? 0;
      setHasUnread(latest > seen);
    } catch { /* silent */ }
  }

  useEffect(() => {
    refreshUnread();
    const id = setInterval(refreshUnread, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, hasChat]);

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      <header className="topbar">
        <div className="topbarInner">
          <Link href="/" className="brandRow">
            <div className="brandLogoBox">CF</div>
            <div>
              <div className="brandTitle">CreatorFarm</div>
              <div className="brandSub">{isSignedIn ? email : "Exclusive content"}</div>
            </div>
          </Link>

          <nav className="desktopNav">
            <Link className={"navPill" + (isActive("/", true) ? " navPillActive" : "")} href="/">Home</Link>
            <Link className={"navPill" + (isActive("/membership") ? " navPillActive" : "")} href="/membership">Membership</Link>
            {hasChat && (
              <Link className={"navPill" + (isActive("/membership/chat") ? " navPillActive" : "")} href="/membership/chat" style={{ position: "relative" }}>
                Chat {hasUnread && <span className="unreadDot" />}
              </Link>
            )}
            {isAdmin && <Link className={"navPill" + (isActive("/admin/chat") ? " navPillActive" : "")} href="/admin/chat">Support</Link>}
            {isAdmin && <Link className={"navPill" + (isActive("/admin/posts") ? " navPillActive" : "")} href="/admin/posts">Posts</Link>}
            {isAdmin && <Link className={"navPill" + (isActive("/admin/settings") ? " navPillActive" : "")} href="/admin/settings">Settings</Link>}
          </nav>

          <div className="navAuthRow">
            {isLoaded && (
              isSignedIn ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="tierBadge">{isAdmin ? "Admin" : tier === "NONE" ? "Free" : tier}</span>
                  <button className="btn btnSm" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href="/signin" className="btn btnSm">Sign in</Link>
                  <Link href="/signup" className="btn btnSm btnPrimary">Join</Link>
                </div>
              )
            )}
            <button className="hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
              <span style={{ background: menuOpen ? "transparent" : undefined }} />
              <span style={{ opacity: menuOpen ? 0 : 1 }} />
              <span />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobileMenu" onClick={() => setMenuOpen(false)}>
            <Link className="mobileMenuItem" href="/">Home</Link>
            <Link className="mobileMenuItem" href="/membership">Membership</Link>
            {hasChat && <Link className="mobileMenuItem" href="/membership/chat">Chat {hasUnread && "🔴"}</Link>}
            {isAdmin && <Link className="mobileMenuItem" href="/admin/chat">Support Chat</Link>}
            {isAdmin && <Link className="mobileMenuItem" href="/admin/posts">Posts Admin</Link>}
            {isAdmin && <Link className="mobileMenuItem" href="/admin/settings">Settings</Link>}
            <div className="mobileMenuDivider" />
            <Link className="mobileMenuItem" href="/terms">Terms</Link>
            <Link className="mobileMenuItem" href="/privacy">Privacy</Link>
            <div className="mobileMenuDivider" />
            {isSignedIn
              ? <button className="mobileMenuItem mobileMenuSignout" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
              : <>
                  <Link className="mobileMenuItem" href="/signin">Sign in</Link>
                  <Link className="mobileMenuItem" href="/signup">Create account</Link>
                </>
            }
          </div>
        )}
      </header>

      {/* Mobile bottom nav */}
      <nav className="bottomNav">
        <Link className={"navItem" + (isActive("/", true) ? " navItemActive" : "")} href="/">
          <Icon name="home" /><span>Home</span>
        </Link>
        <Link className={"navItem" + (isActive("/membership") ? " navItemActive" : "")} href="/membership">
          <Icon name="member" /><span>Member</span>
        </Link>
        {isSignedIn && hasChat ? (
          <Link className={"navItem" + (isActive("/membership/chat") ? " navItemActive" : "")} href="/membership/chat" style={{ position: "relative" }}>
            <Icon name="chat" />{hasUnread && <span className="unreadDot" style={{ top: 8, right: 8 }} />}<span>Chat</span>
          </Link>
        ) : (
          <Link className={"navItem" + (isActive("/signin") ? " navItemActive" : "")} href="/signin">
            <Icon name="signin" /><span>Sign in</span>
          </Link>
        )}
        {isAdmin ? (
          <Link className={"navItem" + (isActive("/admin/posts") ? " navItemActive" : "")} href="/admin/posts">
            <Icon name="posts" /><span>Posts</span>
          </Link>
        ) : (
          <Link className={"navItem" + (isActive("/signup") ? " navItemActive" : "")} href="/signup">
            <Icon name="member" /><span>Join</span>
          </Link>
        )}
        {isAdmin ? (
          <Link className={"navItem" + (isActive("/admin/settings") ? " navItemActive" : "")} href="/admin/settings">
            <Icon name="settings" /><span>Admin</span>
          </Link>
        ) : (
          <Link className={"navItem" + (isActive("/membership") ? " navItemActive" : "")} href="/membership">
            <Icon name="member" /><span>Upgrade</span>
          </Link>
        )}
      </nav>
    </>
  );
}
