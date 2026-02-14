"use client";

import { useEffect, useState } from "react";
import Nav from "@/app/components/Nav";

type Convo = { id: string; email: string | null; name: string | null; updatedAt: string };
type Msg = { id: string; senderRole: string; text: string; createdAt: string };

export default function AdminChatPage() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const [active, setActive] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function loadConvos() {
    setError("");
    const r = await fetch("/api/chat/admin/conversations");
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(j?.error || "Forbidden");
      return;
    }
    setConvos(j.conversations || []);
    if (!active && j.conversations?.[0]?.id) setActive(j.conversations[0].id);
  }

  async function loadMessages(conversationId: string) {
    if (!conversationId) return;
    const r = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
    const j = await r.json().catch(() => ({}));
    if (r.ok) setMessages(j.messages || []);
  }

  async function send() {
    const t = text.trim();
    if (!t || !active) return;
    setLoading(true);
    setText("");
    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: active, text: t }),
    });
    await loadMessages(active);
    await loadConvos();
    setLoading(false);
  }

  useEffect(() => {
    loadConvos();
  }, []);

  useEffect(() => {
    if (active) loadMessages(active);
  }, [active]);

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h1 className="text-2xl font-semibold text-white">Admin Chat Inbox</h1>
          <p className="mt-2 text-white/70">Reply to paid users here.</p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
              {error}
            </div>
          ) : null}

          <div className="mt-6" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14 }}>
            <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,.08)", fontWeight: 700, color: "white" }}>
                Conversations
              </div>
              <div style={{ maxHeight: 520, overflowY: "auto" }}>
                {convos.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActive(c.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: 12,
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,.06)",
                      background: c.id === active ? "rgba(0,0,0,.35)" : "transparent",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{c.name || "User"}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{c.email || ""}</div>
                  </button>
                ))}
                {convos.length === 0 ? (
                  <div style={{ padding: 12, opacity: 0.7, color: "white" }}>No conversations yet.</div>
                ) : null}
              </div>
            </div>

            <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 14 }}>
              <div style={{ height: 460, overflowY: "auto" }}>
                {messages.map((m) => (
                  <div key={m.id} style={{ marginBottom: 10, textAlign: m.senderRole === "ADMIN" ? "right" : "left" }}>
                    <div style={{ display: "inline-block", maxWidth: "80%", padding: "10px 12px", borderRadius: 14, background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.08)" }}>
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
                  placeholder="Reply..."
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                />
                <button
                  onClick={send}
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  Send
                </button>
              </div>

              <div className="mt-3 text-xs text-white/50">This uses polling (simple). Refresh page if needed.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
