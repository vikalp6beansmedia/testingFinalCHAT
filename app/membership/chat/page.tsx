"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "@/app/components/Nav";

type Msg = { id: string; senderRole: string; text: string; createdAt: string };

export default function MemberChatPage() {
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  async function init() {
    setError("");
    const r = await fetch("/api/chat/conversation");
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(j?.error || "Chat not available");
      return;
    }
    setConversationId(j.conversationId);
  }

  async function load() {
    if (!conversationId) return;
    const r = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
    const j = await r.json().catch(() => ({}));
    if (r.ok) setMessages(j.messages || []);
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
    await load();
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

          <div className="mt-6" style={{ height: 420, overflowY: "auto", borderRadius: 16, border: "1px solid rgba(255,255,255,.08)", padding: 14 }}>
            {messages.map((m) => (
              <div key={m.id} style={{ marginBottom: 10, textAlign: m.senderRole === "USER" ? "right" : "left" }}>
                <div style={{ display: "inline-block", maxWidth: "80%", padding: "10px 12px", borderRadius: 14, background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.08)" }}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{m.senderRole}</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="mt-4" style={{ display: "flex", gap: 10 }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
            <button
              onClick={send}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
            >
              Send
            </button>
          </div>

          <div className="mt-3 text-xs text-white/50">Auto-refresh every 3 seconds (simple, reliable).</div>
        </div>
      </div>
    </div>
  );
}
