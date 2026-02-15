"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const LAST_SEEN_KEY = "cf_chat_last_seen_admin_at";

function parseIso(s: string | null | undefined) {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

function Icon({ name }: { name: "home" | "member" | "chat" | "admin" | "posts" | "support" }) {
  // Minimal inline icons (no libs)
  const common = { className: "navIcon", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      );
    case "member":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M21 15a4 4 0 0 1-4 4H9l-4 3v-3H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
          <path d="M7.5 9.5h9" />
          <path d="M7.5 13h6.5" />
        </svg>
      );
    case "admin":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5Z" />
          <path d="M9.5 12.5 11 14l3.5-4" />
        </svg>
      );
    case "posts":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M8 6h13" />
          <path d="M8 12h13" />
          <path d="M8 18h13" />
          <path d="M3 6h.01" />
          <path d="M3 12h.01" />
          <path d="M3 18h.01" />
        </svg>
      );
    case "support":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 12a8 8 0 1 1 16 0" />
          <path d="M4 12v3a2 2 0 0 0 2 2h2v-6H6a2 2 0 0 0-2 2Z" />
          <path d="M20 12v3a2 2 0 0 1-2 2h-2v-6h2a2 2 0 0 1 2 2Z" />
          <path d="M12 20v2" />
        </svg>
      );
  }
}

export default function Nav() {
  const { data } = useSession();
  const tier = (data as any)?.tier ?? "NONE";
  const role = (data as any)?.role ?? "USER";
  const email = data?.user?.email ?? "";

  const hasChat = tier === "BASIC" || tier === "PRO";
  const isAdmin = role === "ADMIN";

  const pathname = usePathname() || "/";

  const [hasUnread, setHasUnread] = useState(false);

  async function refreshUnread() {
    if (!data || !hasChat) {
      setHasUnread(false);
      return;
    }

    try {
      const r = await fetch("/api/chat/unread", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      const latest = parseIso(j?.latestAdminAt ?? null);
      if (!latest) {
        setHasUnread(false);
        return;
      }

      const seenIso = typeof window !== "undefined" ? window.localStorage.getItem(LAST_SEEN_KEY) : null;
      const seen = parseIso(seenIso) ?? 0;
      setHasUnread(latest > seen);
    } catch {
      // silent
    }
  }

  useEffect(() => {
    refreshUnread();
    const id = setInterval(refreshUnread, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, hasChat]);

  const navItems = useMemo(() => {
    const items: Array<{ href: string; label: string; icon: any; show?: boolean; badge?: boolean }> = [
      { href: "/", label: "Home", icon: "home" },
      { href: "/membership", label: "Membership", icon: "member" },
      { href: "/membership/chat", label: "Chat", icon: "chat", show: hasChat, badge: hasUnread },
      { href: "/admin/chat", label: "Admin Chat", icon: "support", show: isAdmin },
      { href: "/admin/posts", label: "Posts", icon: "posts", show: isAdmin },
    ];
    return items.filter((i) => i.show !== false);
  }, [hasChat, hasUnread, isAdmin]);

  // Secondary workflow links (must remain accessible, but visually tucked away)
  const secondaryLinks = useMemo(
    () =>
      [
        { href: "/admin/settings", label: "Admin" },
        { href: "/signin", label: "Sign in page" },
        { href: "/signup", label: "Sign up page" },
      ],
    []
  );

  return (
    <>
      <div className="container topbar topbarCompact">
        <div className="card nav">
          <div className="topbarInner">
            <div className="brandRow">
              <div className="brandLogo" aria-hidden="true" />
              <div style={{ minWidth: 0 }}>
                <div className="brandTitle">CreatorFarm</div>
                <div className="brandSub">{email || "Not signed in"}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="pill">
                Tier: <b>{tier}</b>
              </span>

              {data ? (
                <button className="btn" onClick={() => signOut()}>
                  Sign out
                </button>
              ) : (
                <button className="btn btnPrimary" onClick={() => signIn()}>
                  Sign in
                </button>
              )}
            </div>
          </div>

          {/* Desktop / wide nav links */}
          <div className="navLinks" style={{ marginTop: 12 }}>
            {/* Primary links */}
            <div className="navGroup">
              <Link className={"pill" + (pathname === "/" ? " pillActive" : "")} href="/">
                Home
              </Link>
              <Link className={"pill" + (pathname.startsWith("/membership") ? " pillActive" : "")} href="/membership">
                Membership
              </Link>

              {hasChat ? (
                <Link className={"pill" + (pathname === "/membership/chat" ? " pillActive" : "")} href="/membership/chat" aria-label="Chat">
                  Chat
                  {hasUnread ? <span className="unreadDot" /> : null}
                </Link>
              ) : null}

              {isAdmin ? (
                <Link className={"pill" + (pathname.startsWith("/admin/chat") ? " pillActive" : "")} href="/admin/chat">
                  Admin Chat
                </Link>
              ) : null}
              {isAdmin ? (
                <Link className={"pill" + (pathname.startsWith("/admin/posts") ? " pillActive" : "")} href="/admin/posts">
                  Posts Admin
                </Link>
              ) : null}
            </div>

            {/* Secondary links (kept, but moved into a tidy menu) */}
            <details className="moreMenu">
              <summary className="pill">More</summary>
              <div className="moreMenuPanel">
                {secondaryLinks.map((l) => (
                  <Link key={l.href} className="menuItem" href={l.href}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav (keeps workflow links; desktop uses pills above) */}
      <div className="bottomNav" role="navigation" aria-label="Primary">
        <div className="bottomNavInner">
          <Link className={"navItem" + (pathname === "/" ? " navItemActive" : "")} href="/">
            <Icon name="home" />
            <span>Home</span>
          </Link>

          <Link className={"navItem" + (pathname.startsWith("/membership") ? " navItemActive" : "")} href="/membership">
            <Icon name="member" />
            <span>Member</span>
          </Link>

          {hasChat ? (
            <Link
              className={"navItem" + (pathname === "/membership/chat" ? " navItemActive" : "")}
              href="/membership/chat"
              aria-label="Chat"
            >
              <Icon name="chat" />
              <span>Chat</span>
              {hasUnread ? <span className="unreadDot" /> : null}
            </Link>
          ) : (
            <Link className={"navItem" + (pathname.startsWith("/signin") ? " navItemActive" : "")} href="/signin">
              <Icon name="chat" />
              <span>Sign in</span>
            </Link>
          )}

          {isAdmin ? (
            <Link className={"navItem" + (pathname.startsWith("/admin/posts") ? " navItemActive" : "")} href="/admin/posts">
              <Icon name="posts" />
              <span>Posts</span>
            </Link>
          ) : (
            <Link className={"navItem" + (pathname.startsWith("/admin") ? " navItemActive" : "")} href="/admin/settings">
              <Icon name="admin" />
              <span>Admin</span>
            </Link>
          )}

          {isAdmin ? (
            <Link className={"navItem" + (pathname.startsWith("/admin/chat") ? " navItemActive" : "")} href="/admin/chat">
              <Icon name="support" />
              <span>Support</span>
            </Link>
          ) : (
            <Link className={"navItem" + (pathname.startsWith("/signup") ? " navItemActive" : "")} href="/signup">
              <Icon name="member" />
              <span>Sign up</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
