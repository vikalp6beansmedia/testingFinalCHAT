"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Msg = { id: string; senderRole: string; text: string; createdAt: string };
const LAST_SEEN_KEY = "cf_chat_last_seen_admin_at";

function niceTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

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
  const inputRef = useRef<HTMLInputElement>(null);

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
    setTimeout(() => {
      if (firstLoad.current || near) {
        scrollBottom(firstLoad.current ? "auto" : "smooth");
        firstLoad.current = false;
      }
    }, 0);
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
    inputRef.current?.focus();
  }

  useEffect(() => { if (status === "authenticated") init(); }, [status]);
  useEffect(() => {
    if (!conversationId) return;
    load();
    const id = setInterval(() => load(true), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  if (status === "loading") return (
    <>
      <Nav />
      <div className="container" style={{ paddingTop: 48, textAlign: "center" }}>
        <div className="small muted">Loading…</div>
      </div>
    </>
  );

  if (!session) return (
    <>
      <Nav />
      <div className="container pagePad" style={{ paddingTop: 60, maxWidth: 440 }}>
        <div className="card" style={{ padding: 36, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🔒</div>
          <h2 style={{ marginTop: 0, fontWeight: 900, fontSize: 22 }}>Sign in required</h2>
          <p className="small muted" style={{ marginBottom: 20, lineHeight: 1.7 }}>
            You need to be signed in and subscribed to use member chat.
          </p>
          <Link href="/signin" className="btn btnPrimary full">Sign in</Link>
        </div>
      </div>
    </>
  );

  if (!hasChat) return (
    <>
      <Nav />
      <div className="container pagePad" style={{ paddingTop: 60, maxWidth: 440 }}>
        <div className="card" style={{
          padding: 36, textAlign: "center",
          background: "rgba(108,142,255,.05)",
          borderColor: "rgba(108,142,255,.2)",
        }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>💬</div>
          <h2 style={{ marginTop: 0, fontWeight: 900, fontSize: 22 }}>Members only</h2>
          <p className="small muted" style={{ marginBottom: 20, lineHeight: 1.7 }}>
            Direct chat is available for Basic and Pro subscribers.
          </p>
          <Link href="/membership" className="btn btnPrimary full">View membership plans</Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Nav />
      <main className="container pagePad" style={{ paddingTop: 16, maxWidth: 680 }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 12, flexWrap: "wrap", gap: 10,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Creator Chat</h1>
            <div className="small muted" style={{ marginTop: 3 }}>
              Messages are private between you and the creator
            </div>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 999,
            background: "rgba(80,220,150,.08)", border: "1px solid rgba(80,220,150,.2)",
            fontSize: 12, fontWeight: 700, color: "rgba(160,255,210,.9)",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "rgba(80,220,150,.85)",
              boxShadow: "0 0 6px rgba(80,220,150,.6)",
              display: "inline-block",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            Live
          </span>
        </div>

        {/* Chat card */}
        <div className="card" style={{
          padding: 0, overflow: "hidden",
          border: "1px solid rgba(255,255,255,.09)",
          background: "rgba(7,10,26,.7)",
        }}>
          {error && (
            <div className="errorBox" style={{ margin: 16, borderRadius: 10 }}>
              <div className="small">{error}</div>
            </div>
          )}

          {/* Messages */}
          <div
            ref={listRef}
            style={{
              height: "clamp(300px, 50vh, 480px)",
              overflowY: "auto",
              padding: "20px 16px",
              display: "flex", flexDirection: "column", gap: 12,
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,.08) transparent",
            }}
          >
            {messages.length === 0 && !error && (
              <div style={{ margin: "auto", textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Start the conversation</div>
                <div className="small muted">Send a message — the creator will reply here.</div>
              </div>
            )}

            {messages.map((m) => {
              const isOwn = m.senderRole === "USER";
              return (
                <div key={m.id} style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isOwn ? "flex-end" : "flex-start",
                }}>
                  <div className="chatMeta" style={{ marginBottom: 4, paddingLeft: isOwn ? 0 : 2, paddingRight: isOwn ? 2 : 0 }}>
                    {isOwn ? "You" : "✦ Creator"} · {niceTime(m.createdAt)}
                  </div>
                  <div
                    className={"chatBubble" + (isOwn ? " chatBubbleOwn" : "")}
                    style={!isOwn ? {
                      background: "rgba(255,255,255,.06)",
                      border: "1px solid rgba(255,255,255,.1)",
                    } : {}}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div style={{
            padding: "12px 14px",
            borderTop: "1px solid rgba(255,255,255,.07)",
            display: "flex", gap: 10,
            background: "rgba(0,0,0,.2)",
          }}>
            <input
              ref={inputRef}
              className="input"
              placeholder="Type a message…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              disabled={sending}
              style={{ flex: 1, background: "rgba(255,255,255,.05)" }}
            />
            <button
              className="btn btnPrimary"
              onClick={send}
              disabled={sending || !text.trim()}
              style={{ paddingLeft: 22, paddingRight: 22, fontWeight: 700 }}
            >
              {sending ? "…" : "Send"}
            </button>
          </div>
        </div>

        <div className="small muted" style={{ marginTop: 12, textAlign: "center", fontSize: 12 }}>
          Replies may take some time. You&apos;ll see new messages automatically.
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
