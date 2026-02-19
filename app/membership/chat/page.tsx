"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Msg = { id: string; senderRole: string; text: string; createdAt: string };
const LAST_SEEN_KEY = "cf_chat_last_seen_admin_at";

export default function MemberChatPage() {
  const { data: session, status } = useSession();
  const tier = (session as any)?.tier ?? "NONE";
  const hasChat = tier === "BASIC" || tier === "PRO";

  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef("");
  const firstLoad = useRef(true);

  function scrollBottom(behavior: ScrollBehavior = "smooth") {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  }

  function markSeen(msgs: Msg[]) {
    const last = [...msgs].reverse().find(m => m.senderRole === "ADMIN");
    if (last?.createdAt && typeof window !== "undefined") {
      const cur = Date.parse(window.localStorage.getItem(LAST_SEEN_KEY) || "") || 0;
      const nw = Date.parse(last.createdAt) || 0;
      if (nw > cur) window.localStorage.setItem(LAST_SEEN_KEY, last.createdAt);
    }
  }

  async function init() {
    const r = await fetch("/api/chat/conversation", { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setError(j?.error || "Chat unavailable. Make sure you're subscribed."); return; }
    setConversationId(j.conversationId);
  }

  async function load(silent = false) {
    if (!conversationId) return;
    const r = await fetch(`/api/chat/messages?conversationId=${conversationId}`, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return;
    const next: Msg[] = j.messages || [];
    const lastId = next[next.length - 1]?.id || "";
    if (silent && lastId === lastIdRef.current) return;
    const el = listRef.current;
    const near = el ? (el.scrollHeight - el.scrollTop - el.clientHeight) < 100 : true;
    setMessages(next);
    lastIdRef.current = lastId;
    markSeen(next);
    setTimeout(() => { if (firstLoad.current || near) { scrollBottom(firstLoad.current ? "auto" : "smooth"); firstLoad.current = false; } }, 0);
  }

  async function send() {
    const t = text.trim();
    if (!t || !conversationId || sending) return;
    setSending(true);
    setText("");
    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, text: t }),
    });
    await load();
    setSending(false);
  }

  useEffect(() => { if (status === "authenticated") init(); }, [status]);
  useEffect(() => {
    if (!conversationId) return;
    load();
    const id = setInterval(() => load(true), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  if (status === "loading") return <><Nav /><div className="container" style={{ paddingTop: 32 }}><div className="small muted">Loading…</div></div></>;

  if (!session) return (
    <>
      <Nav />
      <div className="container pagePad" style={{ paddingTop: 32, maxWidth: 480 }}>
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h2 style={{ marginTop: 0 }}>Sign in required</h2>
          <p className="small muted">You need to be signed in and subscribed to use chat.</p>
          <Link href="/signin" className="btn btnPrimary" style={{ marginTop: 8 }}>Sign in</Link>
        </div>
      </div>
    </>
  );

  if (!hasChat) return (
    <>
      <Nav />
      <div className="container pagePad" style={{ paddingTop: 32, maxWidth: 480 }}>
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
          <h2 style={{ marginTop: 0 }}>Members only</h2>
          <p className="small muted">Chat is available for Basic and Pro subscribers.</p>
          <Link href="/membership" className="btn btnPrimary" style={{ marginTop: 8 }}>View plans</Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Nav />
      <main className="container pagePad" style={{ paddingTop: 16, maxWidth: 720 }}>
        <div className="card" style={{ overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>💬 Creator Chat</div>
              <div className="small muted">Ask anything — the creator replies here</div>
            </div>
            <span className="chip ok">Live</span>
          </div>

          {error && <div className="errorBox" style={{ margin: 16 }}><div className="small">{error}</div></div>}

          {/* Messages */}
          <div
            ref={listRef}
            style={{ height: 420, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}
          >
            {messages.length === 0 && !error && (
              <div style={{ textAlign: "center", marginTop: "auto", paddingTop: 60 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
                <div className="small muted">No messages yet. Say hello!</div>
              </div>
            )}
            {messages.map((m) => {
              const isOwn = m.senderRole === "USER";
              return (
                <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start" }}>
                  <div className="chatMeta">{isOwn ? "You" : "Creator"} · {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  <div className={"chatBubble" + (isOwn ? " chatBubbleOwn" : "")}>{m.text}</div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,.08)", display: "flex", gap: 10 }}>
            <input
              className="input"
              placeholder="Type a message…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              disabled={sending}
              style={{ flex: 1 }}
            />
            <button className="btn btnPrimary" onClick={send} disabled={sending || !text.trim()} style={{ paddingLeft: 20, paddingRight: 20 }}>
              {sending ? "…" : "Send"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
