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
    return distance < 90; // px
  }

  function scrollToBottom(behavior: ScrollBehavior) {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }

  function markSeen(latestMessages: Msg[]) {
    // store latest ADMIN message time as "seen" so Nav red-dot can disappear
    const latestAdmin = [...latestMessages]
      .reverse()
      .find((m) => m.senderRole === "ADMIN");

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

    // No changes → don't re-render → no flicker
    if (silent && nextLastId && nextLastId === lastMessageIdRef.current) {
      return;
    }

    const el = listRef.current;
    const shouldStick = el ? isNearBottom(el) : true;

    setMessages(next);
    lastMessageIdRef.current = nextLastId;

    // Mark seen on load
    markSeen(next);

    // Scroll behavior:
    // - first load: jump to bottom (no animation)
    // - silent polling: only if user is already at bottom
    // - after sending: handled by send()
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
    // after sending, always go to bottom smoothly
    setTimeout(() => scrollToBottom("smooth"), 0);
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    // initial load
    load({ silent: false });

    // silent polling (no visible jump)
    const id = setInterval(() => load({ silent: true }), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // On mount, if user had no "seen" value, set it to now to avoid dot on first open
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = window.localStorage.getItem(LAST_SEEN_KEY);
    if (!existing) {
      window.localStorage.setItem(LAST_SEEN_KEY, new Date(lastAdminSeenMs || Date.now()).toISOString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h1 className="text-2xl font-semibold text-white">Chat Support</h1>
          <p className="mt-2 text-white/70">Admin can reply here after you subscribe.</p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
              {error}
            </div>
          ) : null}

          <div
            className="mt-6"
            ref={listRef}
            style={{
              height: 420,
              overflowY: "auto",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,.08)",
              padding: 14,
              scrollBehavior: "smooth",
            }}
          >
            {messages.map((m) => (
              <div key={m.id} style={{ marginBottom: 10, textAlign: m.senderRole === "USER" ? "right" : "left" }}>
                <div
                  style={{
                    display: "inline-block",
                    maxWidth: "80%",
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: "rgba(0,0,0,.35)",
                    border: "1px solid rgba(255,255,255,.08)",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{m.senderRole}</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4" style={{ display: "flex", gap: 10 }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
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

          <div className="mt-3 text-xs text-white/50">
            Auto-refresh is silent. No visible flicker.
          </div>
        </div>
      </div>
    </div>
  );
}
