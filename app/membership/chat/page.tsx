"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Nav from "@/components/Nav";

type Msg = { id: string; senderRole: string; text: string; createdAt: string };

const LAST_SEEN_KEY = "cf_chat_last_seen_admin_at";

function parseIsoMs(s: string | null | undefined) {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

export default function MemberChatPage() {
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string>("");

  const listRef = useRef<HTMLDivElement | null>(null);
  const lastMessageIdRef = useRef<string>("");
  const firstLoadRef = useRef<boolean>(true);

  const lastAdminSeenMs = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return parseIsoMs(window.localStorage.getItem(LAST_SEEN_KEY)) ?? 0;
  }, []);

  async function init() {
    setError("");
    const r = await fetch("/api/chat/conversation", { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(j?.error || "Chat not available");
      return;
    }
    setConversationId(j.conversationId);
  }

  function isNearBottom(el: HTMLDivElement) {
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distance < 90;
  }

  function scrollToBottom(behavior: ScrollBehavior) {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }

  function markSeen(latestMessages: Msg[]) {
    const latestAdmin = [...latestMessages].reverse().find((m) => m.senderRole === "ADMIN");
    const iso = latestAdmin?.createdAt ?? null;
    if (!iso || typeof window === "undefined") return;

    const currentSeen = parseIsoMs(window.localStorage.getItem(LAST_SEEN_KEY)) ?? 0;
    const newSeen = parseIsoMs(iso) ?? 0;
    if (newSeen > currentSeen) {
      window.localStorage.setItem(LAST_SEEN_KEY, iso);
    }
  }

  async function load({ silent }: { silent: boolean }) {
    if (!conversationId) return;
    const r = await fetch(`/api/chat/messages?conversationId=${conversationId}`, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return;

    const next: Msg[] = j.messages || [];
    const nextLastId = next?.[next.length - 1]?.id || "";

    if (silent && nextLastId && nextLastId === lastMessageIdRef.current) {
      return;
    }

    const el = listRef.current;
    const shouldStick = el ? isNearBottom(el) : true;

    setMessages(next);
    lastMessageIdRef.current = nextLastId;

    markSeen(next);

    setTimeout(() => {
      if (!listRef.current) return;
      if (firstLoadRef.current) {
        scrollToBottom("auto");
        firstLoadRef.current = false;
      } else if (shouldStick) {
        scrollToBottom("auto");
      }
    }, 0);
  }

  async function send() {
    const t = text.trim();
    if (!t || !conversationId) return;
    setText("");

    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, text: t }),
    });

    await load({ silent: false });
    setTimeout(() => scrollToBottom("smooth"), 0);
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    load({ silent: false });
    const id = setInterval(() => load({ silent: true }), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = window.localStorage.getItem(LAST_SEEN_KEY);
    if (!existing) {
      window.localStorage.setItem(LAST_SEEN_KEY, new Date(lastAdminSeenMs || Date.now()).toISOString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Nav />
      <div className="container mobile-shell pagePad" style={{ marginTop: 14 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: 0 }}>Chat Support</h1>
              <div className="small muted" style={{ marginTop: 6 }}>
                Admin can reply here after you subscribe.
              </div>
            </div>
            <a className="btn" href="/">
              Back to feed
            </a>
          </div>

          {error ? <div className="errorBox" style={{ marginTop: 12 }}>{error}</div> : null}

          <div
            ref={listRef}
            style={{
              marginTop: 14,
              height: 420,
              overflowY: "auto",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,.10)",
              background: "rgba(0,0,0,.18)",
              padding: 14,
            }}
          >
            {messages.length ? (
              messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    marginBottom: 10,
                    textAlign: m.senderRole === "USER" ? "right" : "left",
                  }}
                >
                  <div className="chatBubble">
                    <div className="chatMeta">{m.senderRole}</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="small muted">No messages yet.</div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="input"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button onClick={send} className="btn btnPrimary" style={{ paddingLeft: 18, paddingRight: 18 }}>
              Send
            </button>
          </div>

          <div className="small muted" style={{ marginTop: 10 }}>
            Auto-refresh is silent. No visible flicker.
          </div>
        </div>
      </div>
    </>
  );
}
